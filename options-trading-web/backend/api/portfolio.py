from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Literal
from datetime import date

router = APIRouter()

class PositionCreate(BaseModel):
    symbol: str
    option_type: Literal["call", "put"]
    strike: float
    expiry: date
    side: Literal["long", "short"]
    quantity: int
    entry_price: float

class PositionResponse(PositionCreate):
    id: int
    current_price: float = 0
    pnl: float = 0

@router.get("/", response_model=List[PositionResponse])
async def get_positions():
    """获取持仓列表"""
    # TODO: 从数据库获取
    return []

@router.post("/", response_model=PositionResponse)
async def create_position(position: PositionCreate):
    """添加持仓"""
    # TODO: 保存到数据库
    return PositionResponse(id=1, **position.dict(), current_price=0, pnl=0)

@router.delete("/{position_id}")
async def delete_position(position_id: int):
    """删除持仓"""
    # TODO: 从数据库删除
    return {"message": "删除成功"}
