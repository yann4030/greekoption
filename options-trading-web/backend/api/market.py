from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from services.market_service import MarketDataService

router = APIRouter()

# 响应模型
class ETFQuoteResponse(BaseModel):
    symbol: str
    name: str
    price: float
    pre_close: float
    change_pct: float
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    volume: Optional[float] = None
    iv: Optional[float] = None
    updated_at: str

class OptionChainItem(BaseModel):
    strike: float
    call_price: float
    call_iv: float
    put_price: float
    put_iv: float

class OptionChainResponse(BaseModel):
    underlying: str
    underlying_price: float
    expiry: str
    strikes: List[OptionChainItem]

# 全局行情服务实例
market_service = MarketDataService()

@router.get("/quote/{symbol}", response_model=ETFQuoteResponse)
async def get_quote(symbol: str):
    """获取实时行情"""
    data = await market_service.get_quote(symbol)
    if not data:
        raise HTTPException(status_code=404, detail="标的不存在")
    return data

@router.get("/etfs", response_model=List[ETFQuoteResponse])
async def get_etf_list():
    """获取ETF列表"""
    data = await market_service.get_all_quotes()
    return data

@router.get("/option-chain", response_model=OptionChainResponse)
async def get_option_chain(
    underlying: str,
    expiry: Optional[str] = None
):
    """获取期权链"""
    result = await market_service.get_option_chain(underlying, expiry)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/history/{symbol}")
async def get_history(
    symbol: str,
    period: str = "1m"  # 1d, 1w, 1m, 3m, 1y
):
    """获取历史数据（模拟）"""
    # TODO: 接入真实历史数据API
    return {
        "symbol": symbol,
        "period": period,
        "data": []
    }
