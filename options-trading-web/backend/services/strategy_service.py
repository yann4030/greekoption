import numpy as np
from scipy.stats import norm
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class OptionLeg:
    """期权腿"""
    side: str  # buy/sell
    option_type: str  # call/put
    strike: float
    quantity: int = 1

@dataclass
class StrategyResult:
    """策略计算结果"""
    name: str
    legs: List[OptionLeg]
    max_profit: float
    max_loss: float
    break_even: List[float]
    net_credit: float
    payoff_data: List[Tuple[float, float]]

class StrategyService:
    """策略计算服务"""
    
    @staticmethod
    def black_scholes(S: float, K: float, T: float, r: float, sigma: float, option_type: str) -> Dict:
        """Black-Scholes定价"""
        if T <= 0:
            payoff = max(0, S - K) if option_type == "call" else max(0, K - S)
            return {
                "price": payoff,
                "delta": 1 if (option_type == "call" and S > K) else (-1 if option_type == "put" and S < K else 0),
                "gamma": 0,
                "theta": 0,
                "vega": 0,
                "rho": 0
            }
        
        d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        Nd1 = norm.cdf(d1)
        Nd2 = norm.cdf(d2)
        Npd1 = norm.pdf(d1)
        
        if option_type == "call":
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
        
        if option_type == "call":
            theta -= r * K * np.exp(-r * T) * Nd2
        else:
            theta += r * K * np.exp(-r * T) * norm.cdf(-d2)
        theta = theta / 365
        
        return {
            "price": round(price, 4),
            "delta": round(delta, 4),
            "gamma": round(gamma, 4),
            "theta": round(theta, 4),
            "vega": round(vega, 4),
            "rho": round(rho, 4)
        }
    
    @staticmethod
    def generate_iron_condor(underlying_price: float, iv: float, risk_level: str = "medium") -> StrategyResult:
        """生成铁鹰策略"""
        # 根据风险等级确定宽度
        width_map = {"low": 0.03, "medium": 0.05, "high": 0.08}
        width = width_map.get(risk_level, 0.05)
        
        # 计算行权价
        atm = underlying_price
        put_sell = round(atm * (1 - width), 2)
        put_buy = round(atm * (1 - width * 2), 2)
        call_sell = round(atm * (1 + width), 2)
        call_buy = round(atm * (1 + width * 2), 2)
        
        # 估算权利金
        time_value = iv / 100 * np.sqrt(30 / 365)
        put_credit = time_value * underlying_price * 0.8
        call_credit = time_value * underlying_price * 0.8
        net_credit = put_credit + call_credit
        
        max_profit = net_credit * 10000
        max_loss = (put_sell - put_buy - net_credit) * 10000
        
        break_even_low = put_sell - net_credit
        break_even_high = call_sell + net_credit
        
        legs = [
            OptionLeg("sell", "put", put_sell),
            OptionLeg("buy", "put", put_buy),
            OptionLeg("sell", "call", call_sell),
            OptionLeg("buy", "call", call_buy),
        ]
        
        # 计算盈亏图
        prices = np.linspace(underlying_price * 0.8, underlying_price * 1.2, 100)
        payoffs = []
        for p in prices:
            payoff = 0
            for leg in legs:
                if leg.option_type == "call":
                    intrinsic = max(0, p - leg.strike)
                else:
                    intrinsic = max(0, leg.strike - p)
                
                if leg.side == "buy":
                    payoff += intrinsic
                else:
                    payoff -= intrinsic
            
            # 加上净权利金
            payoff += net_credit
            payoffs.append((round(p, 2), round(payoff * 10000, 2)))
        
        return StrategyResult(
            name="铁鹰策略",
            legs=legs,
            max_profit=round(max_profit, 2),
            max_loss=round(max_loss, 2),
            break_even=[round(break_even_low, 3), round(break_even_high, 3)],
            net_credit=round(net_credit, 4),
            payoff_data=payoffs
        )
    
    @staticmethod
    def calculate_strategy_greeks(legs: List[OptionLeg], S: float, T: float, r: float, sigma: float) -> Dict:
        """计算策略的Greeks"""
        total_greeks = {"delta": 0, "gamma": 0, "theta": 0, "vega": 0, "rho": 0}
        
        for leg in legs:
            greeks = StrategyService.black_scholes(S, leg.strike, T, r, sigma, leg.option_type)
            multiplier = 1 if leg.side == "buy" else -1
            
            for key in total_greeks:
                total_greeks[key] += greeks[key] * multiplier * leg.quantity
        
        return {k: round(v, 4) for k, v in total_greeks.items()}
