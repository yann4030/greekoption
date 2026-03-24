"""
期权交易平台后端API
FastAPI + PostgreSQL + Redis
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from api import market, strategy, auth, portfolio
from services.market_service import MarketDataService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化
    market_service = MarketDataService()
    asyncio.create_task(market_service.start_realtime_fetch())
    yield
    # 关闭时清理
    await market_service.stop()

app = FastAPI(
    title="期权交易平台API",
    description="前后端分离的期权交易服务",
    version="4.0.0",
    lifespan=lifespan
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境需要限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(market.router, prefix="/api/v1/market", tags=["行情"])
app.include_router(strategy.router, prefix="/api/v1/strategy", tags=["策略"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["持仓"])

@app.get("/")
async def root():
    return {
        "message": "期权交易平台API",
        "version": "4.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
