from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """应用配置"""
    # 数据库
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/options_trading"
    redis_url: str = "redis://localhost:6379/0"
    
    # 安全
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 60 * 24  # 24小时
    
    # 市场数据
    market_data_refresh_interval: int = 5  # 秒
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
