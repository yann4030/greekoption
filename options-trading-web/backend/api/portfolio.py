from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from pydantic import BaseModel
from datetime import date

from database import get_db
from models.database import Position

router = APIRouter()

class PositionCreate(BaseModel):
    symbol: str
    underlying: str
    option_type: str  # call/put
    strike: float
    expiry: date
    side: str  # long/short
    quantity: int
    entry_price: float

class PositionResponse(BaseModel):
    id: int
    symbol: str
    underlying: str
    option_type: str
    strike: float
    expiry: date
    side: str
    quantity: int
    entry_price: float
    current_price: float
    pnl: float

@router.get("/", response_model=List[PositionResponse])
async def get_positions(db: AsyncSession = Depends(get_db)):
    """获取持仓列表（需要JWT验证）"""
    # TODO: 添加用户过滤
    result = await db.execute(select(Position))
    positions = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "symbol": p.symbol,
            "underlying": p.underlying,
            "option_type": p.option_type,
            "strike": p.strike,
            "expiry": p.expiry,
            "side": p.side,
            "quantity": p.quantity,
            "entry_price": p.entry_price,
            "current_price": p.current_price,
            "pnl": p.pnl
        }
        for p in positions
    ]

@router.post("/", response_model=PositionResponse)
async def create_position(position: PositionCreate, db: AsyncSession = Depends(get_db)):
    """添加持仓"""
    # TODO: 添加用户关联
    new_position = Position(**position.dict(), user_id=1)
    db.add(new_position)
    await db.commit()
    await db.refresh(new_position)
    
    return {
        "id": new_position.id,
        "symbol": new_position.symbol,
        "underlying": new_position.underlying,
        "option_type": new_position.option_type,
        "strike": new_position.strike,
        "expiry": new_position.expiry,
        "side": new_position.side,
        "quantity": new_position.quantity,
        "entry_price": new_position.entry_price,
        "current_price": new_position.current_price,
        "pnl": new_position.pnl
    }

@router.delete("/{position_id}")
async def delete_position(position_id: int, db: AsyncSession = Depends(get_db)):
    """删除持仓"""
    result = await db.execute(delete(Position).where(Position.id == position_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="持仓不存在")
    await db.commit()
    return {"message": "删除成功"}

@router.get("/summary")
async def get_portfolio_summary(db: AsyncSession = Depends(get_db)):
    """获取持仓汇总"""
    # TODO: 实现汇总计算
    return {
        "total_value": 0,
        "total_pnl": 0,
        "delta": 0,
        "gamma": 0,
        "theta": 0,
        "vega": 0
    }
