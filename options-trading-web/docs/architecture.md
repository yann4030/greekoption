# 系统架构设计

## 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                      客户端层                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Web浏览器  │  │   移动端    │  │   小程序/APP    │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
          └────────────────┴──────────────────┘
                           │
                    HTTPS/WSS
                           │
┌──────────────────────────▼──────────────────────────────┐
│                      接入层                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Nginx (反向代理 + 负载均衡 + SSL终止 + 静态资源)    ││
│  └─────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                      应用层                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │  FastAPI (REST API + WebSocket)                     ││
│  │  - 用户认证 (JWT)                                   ││
│  │  - 行情数据接口                                     ││
│  │  - 策略计算接口                                     ││
│  │  - 持仓管理接口                                     ││
│  └─────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                      服务层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ 行情服务    │  │ 策略服务    │  │  用户服务       │  │
│  │ - 数据获取  │  │ - BS计算   │  │  - 认证授权     │  │
│  │ - 数据缓存  │  │ - Greeks   │  │  - 持仓管理     │  │
│  │ - 实时推送  │  │ - 策略生成  │  │  - 历史记录     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                      数据层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ PostgreSQL  │  │    Redis    │  │   外部API       │  │
│  │ - 用户数据  │  │ - 缓存     │  │ - 东方财富      │  │
│  │ - 持仓数据  │  │ - 会话     │  │ - 新浪财经      │  │
│  │ - 交易记录  │  │ - 队列     │  │ - 腾讯财经      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## API设计

### 行情数据接口
```
GET /api/v1/market/quote/{code}     # 获取实时行情
GET /api/v1/market/option-chain     # 获取期权链
GET /api/v1/market/history          # 获取历史数据
WS  /ws/market                      # WebSocket实时推送
```

### 策略计算接口
```
POST /api/v1/calc/price             # 期权定价计算
POST /api/v1/calc/greeks            # Greeks计算
POST /api/v1/strategy/generate      # 生成策略方案
POST /api/v1/strategy/payoff        # 计算盈亏图
```

### 用户接口
```
POST /api/v1/auth/register          # 注册
POST /api/v1/auth/login             # 登录
GET  /api/v1/user/portfolio         # 获取持仓
POST /api/v1/user/position          # 添加持仓
```

## 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 持仓表 (positions)
```sql
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    option_type VARCHAR(10) NOT NULL,  -- call/put
    strike DECIMAL(10,4) NOT NULL,
    expiry DATE NOT NULL,
    side VARCHAR(10) NOT NULL,         -- long/short
    quantity INTEGER NOT NULL,
    entry_price DECIMAL(10,4) NOT NULL,
    current_price DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 行情缓存表 (market_data)
```sql
CREATE TABLE market_data (
    symbol VARCHAR(20) PRIMARY KEY,
    price DECIMAL(10,4) NOT NULL,
    change_pct DECIMAL(6,2),
    iv DECIMAL(6,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 部署架构

### Docker Compose配置
```yaml
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
  
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/options
      - REDIS_URL=redis://redis:6379
  
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
```
