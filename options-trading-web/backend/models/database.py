from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    positions = relationship("Position", back_populates="user", cascade="all, delete-orphan")

class Position(Base):
    """持仓表"""
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(20), nullable=False)  # 期权代码
    underlying = Column(String(20), nullable=False)  # 标的代码
    option_type = Column(String(10), nullable=False)  # call/put
    strike = Column(Float, nullable=False)  # 行权价
    expiry = Column(Date, nullable=False)  # 到期日
    side = Column(String(10), nullable=False)  # long/short
    quantity = Column(Integer, nullable=False)  # 数量
    entry_price = Column(Float, nullable=False)  # 入场价格
    current_price = Column(Float, default=0)  # 当前价格
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="positions")
    
    @property
    def pnl(self):
        """盈亏"""
        return (self.current_price - self.entry_price) * self.quantity * 10000

class MarketData(Base):
    """行情数据缓存表"""
    __tablename__ = "market_data"
    
    symbol = Column(String(20), primary_key=True)
    name = Column(String(50))
    price = Column(Float, nullable=False)
    pre_close = Column(Float)
    change_pct = Column(Float)
    iv = Column(Float)  # 隐含波动率
    volume = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow)
