# Options Trading Web Platform

## 项目概述
前后端分离的期权交易平台，支持部署到互联网

## 技术架构

### 前端 (Frontend)
- **框架**: Vue.js 3 + TypeScript
- **UI库**: Element Plus / Ant Design Vue
- **图表**: ECharts
- **状态管理**: Pinia
- **构建工具**: Vite

### 后端 (Backend)
- **框架**: Python FastAPI
- **数据库**: PostgreSQL + Redis
- **任务队列**: Celery + Redis
- **数据获取**: 东方财富/新浪API
- **部署**: Docker + Nginx

## 项目结构
```
options-trading-web/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── views/            # 页面
│   │   ├── stores/           # 状态管理
│   │   ├── api/              # API接口
│   │   └── utils/            # 工具函数
│   ├── public/               # 静态资源
│   └── package.json
├── backend/                  # 后端项目
│   ├── api/                  # API路由
│   ├── services/             # 业务逻辑
│   ├── models/               # 数据模型
│   ├── tasks/                # 异步任务
│   └── requirements.txt
├── docs/                     # 文档
├── scripts/                  # 部署脚本
└── docker-compose.yml        # 容器编排
```

## 部署方案

### 方案1: 云服务器部署 (推荐)
- 阿里云/腾讯云/华为云
- 配置: 2核4G + 50GB SSD
- 域名 + HTTPS证书

### 方案2: Serverless部署
- Vercel (前端) + Railway/Render (后端)
- 免费额度足够初期使用

### 方案3: 自建服务器
- 需要公网IP
- 配置Nginx反向代理
- 申请SSL证书

## 开发计划

### Phase 1: 基础架构 (v4.0)
- [ ] 搭建Vue3+FastAPI基础框架
- [ ] 配置Docker开发环境
- [ ] 数据库设计

### Phase 2: 核心功能迁移 (v4.1)
- [ ] Black-Scholes计算API
- [ ] 实时行情数据服务
- [ ] 前端页面重构

### Phase 3: 用户系统 (v4.2)
- [ ] 用户注册/登录
- [ ] 持仓管理持久化
- [ ] 交易记录存储

### Phase 4: 高级功能 (v4.3)
- [ ] WebSocket实时推送
- [ ] 预警系统
- [ ] 回测引擎

## 版本管理
- Git主分支: main
- 开发分支: develop
- 功能分支: feature/*
- 发布标签: v4.x.x
