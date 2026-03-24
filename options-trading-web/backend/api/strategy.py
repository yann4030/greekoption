from fastapi import APIRouter, HTTPException
from typing import List, Literal
from pydantic import BaseModel

from services.strategy_service import StrategyService

router = APIRouter()
strategy_service = StrategyService()

# 请求模型
class PriceRequest(BaseModel):
    S: float
    K: float
    T: float
    r: float
    sigma: float
    option_type: Literal["call", "put"]

class PriceResponse(BaseModel):
    price: float
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float

class StrategyRequest(BaseModel):
    underlying: str
    underlying_price: float
    iv: float
    strategy_type: Literal["iron_condor", "bull_call", "bear_put", "straddle", "strangle"]
    risk_level: Literal["low", "medium", "high"] = "medium"

class StrategyLeg(BaseModel):
    side: str
    option_type: str
    strike: float
    quantity: int = 1

class StrategyResponse(BaseModel):
    name: str
    legs: List[StrategyLeg]
    max_profit: float
    max_loss: float
    break_even: List[float]
    net_credit: float
    payoff_data: List[List[float]]

@router.post("/price", response_model=PriceResponse)
async def calculate_price(request: PriceRequest):
    """Black-Scholes期权定价"""
    result = strategy_service.black_scholes(
        request.S,
        request.K,
        request.T,
        request.r / 100,
        request.sigma / 100,
        request.option_type
    )
    return result

@router.post("/generate", response_model=StrategyResponse)
async def generate_strategy(request: StrategyRequest):
    """生成交易策略"""
    if request.strategy_type == "iron_condor":
        result = strategy_service.generate_iron_condor(
            request.underlying_price,
            request.iv,
            request.risk_level
        )
        return {
            "name": result.name,
            "legs": [{"side": l.side, "option_type": l.option_type, "strike": l.strike, "quantity": l.quantity} for l in result.legs],
            "max_profit": result.max_profit,
            "max_loss": result.max_loss,
            "break_even": result.break_even,
            "net_credit": result.net_credit,
            "payoff_data": [[p[0], p[1]] for p in result.payoff_data]
        }
    else:
        raise HTTPException(status_code=400, detail="暂不支持该策略类型")

@router.post("/payoff")
async def calculate_payoff(strategy: dict):
    """计算策略盈亏图"""
    # TODO: 实现盈亏图计算
    return {
        "prices": list(range(80, 121)),
        "payoffs": [0] * 41
    }

@router.post("/greeks")
async def calculate_greeks(legs: List[StrategyLeg], S: float, T: float, r: float, sigma: float):
    """计算策略Greeks"""
    legs_obj = [StrategyService.OptionLeg(l.side, l.option_type, l.strike, l.quantity) for l in legs]
    result = strategy_service.calculate_strategy_greeks(legs_obj, S, T, r, sigma)
    return result
