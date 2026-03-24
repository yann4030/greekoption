import asyncio
import httpx
from typing import Dict, Optional
from datetime import datetime

class MarketDataService:
    """行情数据服务"""
    
    def __init__(self):
        self.running = False
        self.data: Dict[str, dict] = {}
        self.etf_codes = {
            "510050": "50ETF",
            "510300": "300ETF",
            "510500": "500ETF"
        }
    
    async def start_realtime_fetch(self):
        """启动实时数据获取"""
        self.running = True
        while self.running:
            try:
                await self._fetch_all()
                await asyncio.sleep(5)  # 每5秒更新
            except Exception as e:
                print(f"获取行情失败: {e}")
                await asyncio.sleep(10)
    
    async def stop(self):
        """停止服务"""
        self.running = False
    
    async def _fetch_all(self):
        """获取所有ETF数据"""
        async with httpx.AsyncClient() as client:
            for code, name in self.etf_codes.items():
                try:
                    data = await self._fetch_etf(client, code)
                    self.data[code] = data
                except Exception as e:
                    print(f"获取{code}失败: {e}")
    
    async def _fetch_etf(self, client: httpx.AsyncClient, code: str) -> dict:
        """获取单个ETF数据"""
        # 东方财富API
        url = f"https://push2.eastmoney.com/api/qt/stock/get?secid=1.{code}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60"
        
        response = await client.get(url, timeout=10)
        result = response.json()
        
        data = result.get("data", {})
        
        # 字段映射: f43=现价, f60=昨收
        price = data.get("f43", 0) / 1000  # 转换为元
        pre_close = data.get("f60", 0) / 1000
        
        return {
            "symbol": code,
            "name": self.etf_codes.get(code, ""),
            "price": price,
            "pre_close": pre_close,
            "change_pct": round((price - pre_close) / pre_close * 100, 2) if pre_close else 0,
            "iv": 22.5,  # TODO: 从期权数据计算
            "updated_at": datetime.now().isoformat()
        }
    
    def get_quote(self, symbol: str) -> Optional[dict]:
        """获取行情"""
        return self.data.get(symbol)
    
    def get_all_quotes(self) -> Dict[str, dict]:
        """获取所有行情"""
        return self.data
