// 行情数据类型
export interface ETFQuote {
  symbol: string
  name: string
  price: number
  pre_close: number
  change_pct: number
  iv?: number
  updated_at: string
}

// 期权定价请求
export interface OptionPriceRequest {
  S: number
  K: number
  T: number
  r: number
  sigma: number
  option_type: "call" | "put"
}

// 期权定价响应
export interface OptionPriceResponse {
  price: number
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
}

// 策略类型
export interface StrategyLeg {
  side: "buy" | "sell"
  option_type: "call" | "put"
  strike: number
  price: number
}

export interface Strategy {
  name: string
  type: string
  legs: StrategyLeg[]
  max_profit: number
  max_loss: number
  break_even: number[]
}

// 持仓类型
export interface Position {
  id: number
  symbol: string
  option_type: "call" | "put"
  strike: number
  expiry: string
  side: "long" | "short"
  quantity: number
  entry_price: number
  current_price: number
  pnl: number
}
