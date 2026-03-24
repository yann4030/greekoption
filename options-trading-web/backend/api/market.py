from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class QuoteResponse(BaseModel):
    symbol: str
    name: str
    price: float
    pre_close: float
    change_pct: float
    iv: Optional[float] = None
    updated_at: str

class OptionChainItem(BaseModel):
    strike: float
    call_price: float
    call_iv: float
    put_price: float
    put_iv: float

@router.get("/quote/{symbol}", response_model=QuoteResponse)
async def get_quote(symbol: str):
    """获取实时行情"""
    # TODO: 从Redis缓存或数据库获取
    return {
        "symbol": symbol,
        "name": "50ETF",
        "price": 2.870,
        "pre_close": 2.868,
        "change_pct": 0.07,
        "iv": 22.5,
        "updated_at": "2024-03-24T12:00:00"
    }

@router.get("/option-chain")
async def get_option_chain(
    underlying: str,
    expiry: Optional[str] = None
):
    """获取期权链"""
    # TODO: 实现期权链数据获取
    return {
        "underlying": underlying,
        "expiry": expiry or "2024-04-24",
        "strikes": []
    }

@router.get("/etfs", response_model=List[QuoteResponse])
async def get_etf_list():
    """获取ETF列表"""
    return [
        {
            "symbol": "510050",
            "name": "50ETF",
            "price": 2.870,
            "pre_close": 2.868,
            "change_pct": 0.07,
            "iv": 22.5,
            "updated_at": "2024-03-24T12:00:00"
        },
        {
            "symbol": "510300",
            "name": "300ETF",
            "price": 4.445,
            "pre_close": 4.430,
            "change_pct": 0.34,
            "iv": 21.8,
            "updated_at": "2024-03-24T12:00:00"
        },
        {
            "symbol": "510500",
            "name": "500ETF",
            "price": 7.548,
            "pre_close": 7.512,
            "change_pct": 0.48,
            "iv": 25.2,
            "updated_at": "2024-03-24T12:00:00"
        }
    ]
