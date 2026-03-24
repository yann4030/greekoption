from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal, List
import numpy as np
from scipy.stats import norm

router = APIRouter()

class PriceRequest(BaseModel):
    S: float  # 标的价格
    K: float  # 行权价
    T: float  # 剩余时间(年)
    r: float  # 无风险利率
    sigma: float  # 波动率
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
    strategy_type: Literal["iron_condor", "bull_call", "bear_put", "straddle"]
    risk_level: Literal["low", "medium", "high"]

@router.post("/price", response_model=PriceResponse)
async def calculate_price(request: PriceRequest):
    """Black-Scholes期权定价"""
    S, K, T, r, sigma = request.S, request.K, request.T, request.r, request.sigma
    
    if T <= 0:
        payoff = max(0, S - K) if request.option_type == "call" else max(0, K - S)
        return PriceResponse(price=payoff, delta=0, gamma=0, theta=0, vega=0, rho=0)
    
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    Nd1 = norm.cdf(d1)
    Nd2 = norm.cdf(d2)
    Npd1 = norm.pdf(d1)
    
    if request.option_type == "call":
        price = S * Nd1 - K * np.exp(-r * T) * Nd2
        delta = Nd1
        rho = K * T * np.exp(-r * T) * Nd2 / 100
    else:
        price = K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)
        delta = Nd1 - 1
        rho = -K * T * np.exp(-r * T) * norm.cdf(-d2) / 100
    
    gamma = Npd1 / (S * sigma * np.sqrt(T))
    vega = S * Npd1 * np.sqrt(T) / 100
    theta = -(S * Npd1 * sigma) / (2 * np.sqrt(T))
    if request.option_type == "call":
        theta -= r * K * np.exp(-r * T) * Nd2
    else:
        theta += r * K * np.exp(-r * T) * norm.cdf(-d2)
    theta = theta / 365
    
    return PriceResponse(
        price=round(price, 4),
        delta=round(delta, 4),
        gamma=round(gamma, 4),
        theta=round(theta, 4),
        vega=round(vega, 4),
        rho=round(rho, 4)
    )

@router.post("/generate")
async def generate_strategy(request: StrategyRequest):
    """生成交易策略"""
    # TODO: 实现策略生成逻辑
    return {
        "strategy": request.strategy_type,
        "underlying": request.underlying,
        "legs": [],
        "max_profit": 0,
        "max_loss": 0,
        "break_even": []
    }

@router.post("/payoff")
async def calculate_payoff(strategy: dict):
    """计算策略盈亏图"""
    # TODO: 实现盈亏图计算
    return {
        "prices": list(range(80, 121)),
        "payoffs": [0] * 41
    }
