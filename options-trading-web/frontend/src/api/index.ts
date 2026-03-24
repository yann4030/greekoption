import axios from "axios"
import type { ETFQuote, OptionPriceRequest, OptionPriceResponse } from "@/types"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// 行情API
export const getETFList = async (): Promise<ETFQuote[]> => {
  return apiClient.get("/market/etfs")
}

export const getQuote = async (symbol: string): Promise<ETFQuote> => {
  return apiClient.get(`/market/quote/${symbol}`)
}

// 计算器API
export const calculatePrice = async (
  params: OptionPriceRequest
): Promise<OptionPriceResponse> => {
  return apiClient.post("/strategy/price", params)
}

// 策略API
export const generateStrategy = async (data: {
  underlying: string
  strategy_type: string
  risk_level: string
}) => {
  return apiClient.post("/strategy/generate", data)
}

export const calculatePayoff = async (strategy: any) => {
  return apiClient.post("/strategy/payoff", strategy)
}

// 持仓API
export const getPositions = async () => {
  return apiClient.get("/portfolio/")
}

export const createPosition = async (data: any) => {
  return apiClient.post("/portfolio/", data)
}

export const deletePosition = async (id: number) => {
  return apiClient.delete(`/portfolio/${id}`)
}

// 认证API
export const login = async (username: string, password: string) => {
  return apiClient.post("/auth/login", { username, password })
}

export const register = async (data: {
  username: string
  email: string
  password: string
}) => {
  return apiClient.post("/auth/register", data)
}

export default apiClient
