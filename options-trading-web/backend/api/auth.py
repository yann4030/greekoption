from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    """用户登录"""
    # TODO: 实现JWT认证
    return {"token": "dummy_token", "user": {"username": request.username}}

@router.post("/register")
async def register(request: RegisterRequest):
    """用户注册"""
    # TODO: 实现用户注册
    return {"message": "注册成功"}
