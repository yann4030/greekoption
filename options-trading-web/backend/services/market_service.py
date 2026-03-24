import asyncio
import httpx
from typing import Dict, Optional, List
from datetime import datetime
import json
import redis.asyncio as redis
from config import get_settings

settings = get_settings()

class MarketDataService:
    """行情数据服务 - 支持东方财富API"""
    
    def __init__(self):
        self.running = False
        self.data: Dict[str, dict] = {}
        self.redis: Optional[redis.Redis] = None
        self.etf_codes = {
            "510050": "50ETF",
            "510300": "300ETF", 
            "510500": "500ETF",
            "159915": "创业板ETF",
            "588000": "科创50ETF"
        }
    
    async def init_redis(self):
        """初始化Redis连接"""
        try:
            self.redis = await redis.from_url(settings.redis_url)
        except Exception as e:
            print(f"⚠️ Redis连接失败: {e}")
    
    async def start_realtime_fetch(self):
        """启动实时数据获取"""
        await self.init_redis()
        self.running = True
        
        print("🚀 启动行情数据服务...")
        
        # 先获取一次数据
        await self._fetch_all()
        
        while self.running:
            try:
                await self._fetch_all()
                await self._save_to_redis()
                await asyncio.sleep(settings.market_data_refresh_interval)
            except Exception as e:
                print(f"❌ 获取行情失败: {e}")
                await asyncio.sleep(10)
    
    async def stop(self):
        """停止服务"""
        self.running = False
        if self.redis:
            await self.redis.close()
    
    async def _fetch_all(self):
        """获取所有ETF数据"""
        async with httpx.AsyncClient() as client:
            for code, name in self.etf_codes.items():
                try:
                    data = await self._fetch_etf(client, code)
                    self.data[code] = data
                    print(f"✅ {name}: {data["price"]} ({data["change_pct"]}%)")
                except Exception as e:
                    print(f"❌ 获取{code}失败: {e}")
    
    async def _fetch_etf(self, client: httpx.AsyncClient, code: str) -> dict:
        """获取单个ETF数据 - 东方财富API"""
        url = f"https://push2.eastmoney.com/api/qt/stock/get?secid=1.{code}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f170"
        
        response = await client.get(url, timeout=10)
        result = response.json()
        
        data = result.get("data", {})
        
        # 字段映射
        price = data.get("f43", 0) / 1000
        pre_close = data.get("f60", 0) / 1000
        change_pct = data.get("f170", 0) / 100
        
        # 计算IV
        iv = self._estimate_iv(code, change_pct)
        
        return {
            "symbol": code,
            "name": self.etf_codes.get(code, data.get("f58", "")),
            "price": round(price, 3),
            "pre_close": round(pre_close, 3),
            "change_pct": round(change_pct, 2),
            "open": round(data.get("f44", 0) / 1000, 3),
            "high": round(data.get("f45", 0) / 1000, 3),
            "low": round(data.get("f46", 0) / 1000, 3),
            "volume": data.get("f47", 0),
            "amount": data.get("f48", 0),
            "iv": iv,
            "updated_at": datetime.now().isoformat()
        }
    
    def _estimate_iv(self, code: str, change_pct: float) -> float:
        """估算隐含波动率"""
        base_iv = {
            "510050": 22.0,
            "510300": 21.5,
            "510500": 25.0,
            "159915": 28.0,
            "588000": 30.0
        }
        
        iv = base_iv.get(code, 22.0)
        iv += abs(change_pct) * 0.5
        
        return round(iv, 2)
    
    async def _save_to_redis(self):
        """保存到Redis缓存"""
        if not self.redis:
            return
        
        try:
            for code, data in self.data.items():
                key = f"market:{code}"
                await self.redis.setex(key, 60, json.dumps(data))
        except Exception as e:
            print(f"⚠️ 保存到Redis失败: {e}")
    
    async def get_quote(self, symbol: str) -> Optional[dict]:
        """获取行情"""
        if self.redis:
            try:
                data = await self.redis.get(f"market:{symbol}")
                if data:
                    return json.loads(data)
            except Exception:
                pass
        
        return self.data.get(symbol)
    
    async def get_all_quotes(self) -> List[dict]:
        """获取所有行情"""
        return list(self.data.values())
    
    async def get_option_chain(self, underlying: str, expiry: str = None) -> dict:
        """获取期权链（模拟数据）"""
        etf = self.data.get(underlying)
        if not etf:
            return {"error": "标的不存在"}
        
        price = etf["price"]
        
        # 生成行权价列表
        if underlying == "510500":
            interval = 0.25
        else:
            interval = 0.05
        
        atm = round(price / interval) * interval
        strikes = [round(atm + (i - 5) * interval, 3) for i in range(11)]
        
        # 生成期权链数据
        chain = []
        for strike in strikes:
            distance = abs(strike - price)
            
            # Call价格
            if strike <= price:
                call_price = max(0.001, (price - strike) + price * 0.02)
            else:
                call_price = max(0.001, price * 0.02 - (strike - price) * 0.3)
            
            # Put价格
            if strike >= price:
                put_price = max(0.001, (strike - price) + price * 0.02)
            else:
                put_price = max(0.001, price * 0.02 - (price - strike) * 0.3)
            
            chain.append({
                "strike": strike,
                "call_price": round(call_price, 4),
                "call_iv": round(etf["iv"] * (1 + distance * 0.1), 2),
                "put_price": round(put_price, 4),
                "put_iv": round(etf["iv"] * (1 + distance * 0.1), 2),
            })
        
        return {
            "underlying": underlying,
            "underlying_price": price,
            "expiry": expiry or "2024-04-24",
            "strikes": chain
        }
