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
            "510050": "50ETF华夏",
            "510300": "300ETF华泰柏瑞",
            "510500": "500ETF南方",
            "159915": "创业板ETF",
            "588000": "科创50ETF"
        }
    
    async def init_redis(self):
        """初始化Redis连接"""
        try:
            self.redis = await redis.from_url(settings.redis_url)
        except Exception as e:
            print(f"Redis连接失败: {e}")
    
    async def start_realtime_fetch(self):
        """启动实时数据获取"""
        await self.init_redis()
        self.running = True
        
        # 先获取一次数据
        await self._fetch_all()
        
        while self.running:
            try:
                await self._fetch_all()
                await self._save_to_redis()
                await asyncio.sleep(settings.market_data_refresh_interval)
            except Exception as e:
                print(f"获取行情失败: {e}")
                await asyncio.sleep(10)
    
    async def stop(self):
        """停止服务"""
        self.running = False
        if self.redis:
            await self.redis.close()
    
    async def _fetch_all(self):
        """获取所有ETF数据"""
        async with httpx.AsyncClient() as client:
            tasks = []
            for code in self.etf_codes.keys():
                tasks.append(self._fetch_etf(client, code))
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for code, result in zip(self.etf_codes.keys(), results):
                if isinstance(result, Exception):
                    print(f"获取{code}失败: {result}")
                else:
                    self.data[code] = result
    
    async def _fetch_etf(self, client: httpx.AsyncClient, code: str) -> dict:
        """获取单个ETF数据 - 东方财富API"""
        url = f"https://push2.eastmoney.com/api/qt/stock/get?secid=1.{code}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60,f170"
        
        response = await client.get(url, timeout=10)
        result = response.json()
        
        data = result.get("data", {})
        
        # 字段映射
        # f43=现价(分), f44=今开(分), f45=最高(分), f46=最低(分)
        # f47=成交量(手), f48=成交额(元), f57=代码, f58=名称
        # f60=昨收(分), f170=涨跌幅(%)
        price = data.get("f43", 0) / 1000
        pre_close = data.get("f60", 0) / 1000
        change_pct = data.get("f170", 0) / 100
        
        # 计算IV（简化版，实际应从期权数据计算）
        iv = self._estimate_iv(code, change_pct)
        
        return {
            "symbol": code,
            "name": self.etf_codes.get(code, data.get("f58", "")),
            "price": round(price, 3),
            "pre_close": round(pre_close, 3),
            "change_pct": round(change_pct, 2),
            "open": data.get("f44", 0) / 1000,
            "high": data.get("f45", 0) / 1000,
            "low": data.get("f46", 0) / 1000,
            "volume": data.get("f47", 0),
            "amount": data.get("f48", 0),
            "iv": iv,
            "updated_at": datetime.now().isoformat()
        }
    
    def _estimate_iv(self, code: str, change_pct: float) -> float:
        """估算隐含波动率"""
        # 基础IV
        base_iv = {
            "510050": 22.0,
            "510300": 21.5,
            "510500": 25.0,
            "159915": 28.0,
            "588000": 30.0
        }
        
        iv = base_iv.get(code, 22.0)
        
        # 根据涨跌幅调整（波动越大IV越高）
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
            print(f"保存到Redis失败: {e}")
    
    async def get_quote(self, symbol: str) -> Optional[dict]:
        """获取行情"""
        # 先查Redis
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
            
            # Call价格（价内更高）
            if strike <= price:
                call_price = max(0.001, (price - strike) + price * 0.02)
            else:
                call_price = max(0.001, price * 0.02 - (strike - price) * 0.3)
            
            # Put价格（价内更高）
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
