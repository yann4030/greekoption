# 期权交易平台 - 启动指南

## 系统要求
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

## 快速启动

### 1. 启动数据库（Docker）
```bash
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15-alpine
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 2. 启动后端
```bash
cd options-trading-web/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
后端运行在 http://localhost:8000
API文档: http://localhost:8000/docs

### 3. 启动前端
```bash
cd options-trading-web/frontend
npm install
npm run dev
```
前端运行在 http://localhost:3000

## 功能清单

### ✅ 已完成
- [x] 行情看板 - 实时ETF数据、最佳推荐
- [x] 期权计算器 - Black-Scholes定价、Greeks计算
- [x] 策略分析 - 铁鹰策略生成、盈亏图可视化
- [x] 持仓管理 - 增删改查、盈亏汇总
- [x] Greeks分析 - 风险仪表盘、雷达图、时间衰减
- [x] 后端API - 东方财富实时数据、JWT认证

### 🚧 待完善
- [ ] WebSocket实时推送
- [ ] 历史数据回测
- [ ] 预警系统
- [ ] 移动端适配

## 部署

### Docker部署
```bash
cd options-trading-web
docker-compose up -d
```

### 云服务器部署
见 scripts/deploy.sh
