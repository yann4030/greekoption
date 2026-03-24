# 免费云平台部署指南

## 方案一: Vercel(前端) + Render(后端) - 推荐 ⭐

### 特点
- ✅ 完全免费
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自动部署(Git推送即部署)

---

## 部署步骤

### 第一步: 准备GitHub仓库

1. 创建GitHub仓库: `options-trading-platform`
2. 上传代码:
```bash
cd options-trading-web
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/options-trading-platform.git
git push -u origin main
```

---

### 第二步: 部署后端到 Render

#### 1. 注册账号
- 访问 https://render.com
- 用GitHub账号登录

#### 2. 创建PostgreSQL数据库
- 点击 "New +" → "PostgreSQL"
- 名称: `options-trading-db`
- 免费额度: 1GB存储

#### 3. 创建Redis
- 点击 "New +" → "Redis"
- 名称: `options-trading-redis`
- 免费额度: 25MB

#### 4. 部署Web服务
- 点击 "New +" → "Web Service"
- 选择GitHub仓库
- 配置:
  - **Name**: `options-trading-api`
  - **Environment**: Python 3
  - **Build Command**: `pip install -r backend/requirements.txt`
  - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- 环境变量:
  - `DATABASE_URL`: (从PostgreSQL复制)
  - `REDIS_URL`: (从Redis复制)
  - `SECRET_KEY`: (随机生成)
  - `CORS_ORIGINS`: `https://your-frontend.vercel.app`

#### 5. 获取API地址
- 部署完成后，复制URL: `https://options-trading-api.onrender.com`

---

### 第三步: 部署前端到 Vercel

#### 1. 注册账号
- 访问 https://vercel.com
- 用GitHub账号登录

#### 2. 导入项目
- 点击 "Add New Project"
- 选择GitHub仓库
- 配置:
  - **Framework Preset**: Vue.js
  - **Root Directory**: `frontend`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
- 环境变量:
  - `VITE_API_URL`: `https://options-trading-api.onrender.com/api/v1`

#### 3. 部署
- 点击 "Deploy"
- 等待构建完成
- 获得域名: `https://options-trading.vercel.app`

---

### 第四步: 更新CORS配置

1. 回到Render，更新环境变量:
   - `CORS_ORIGINS`: `https://options-trading.vercel.app`

2. 重启后端服务

---

## 方案二: Railway (前后端一体)

### 特点
- ✅ 完全免费 (每月$5额度)
- ✅ 一键部署
- ✅ 自动HTTPS

### 部署步骤

1. 注册 https://railway.app
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择仓库
4. Railway自动检测配置
5. 添加PostgreSQL和Redis插件
6. 部署完成

---

## 方案三: Fly.io (全球部署)

### 特点
- ✅ 免费额度充足
- ✅ 全球多区域
- ✅ 容器化部署

### 部署步骤

```bash
# 安装Fly CLI
winget install Fly-io.flyctl

# 登录
fly auth login

# 创建应用
fly launch --name options-trading

# 创建数据库
fly postgres create --name options-trading-db

# 创建Redis
fly redis create --name options-trading-redis

# 部署
fly deploy
```

---

## 免费额度对比

| 平台 | 前端 | 后端 | 数据库 | 优点 |
|------|------|------|--------|------|
| **Vercel+Render** | 无限流量 | 750小时/月 | 1GB+25MB | 最稳定 |
| **Railway** | $5额度 | $5额度 | 共享 | 最简单 |
| **Fly.io** | 3GB/月 | 2340小时/月 | 3GB | 全球部署 |

---

## 推荐选择

**新手**: Railway (一键部署)
**稳定**: Vercel + Render (分离部署)
**全球**: Fly.io (多区域)

---

## 部署后配置

### 1. 自定义域名 (可选)
- Vercel: 支持免费自定义域名
- Render: 支持自定义域名
- Cloudflare: 免费CDN+SSL

### 2. 监控
- UptimeRobot: 免费监控 (每5分钟检查)
- Google Analytics: 访问统计

### 3. 备份
- Render PostgreSQL: 自动每日备份
- 手动备份: `pg_dump` 导出

---

## 故障排查

### 前端无法连接后端
1. 检查CORS配置
2. 确认API地址正确
3. 查看浏览器控制台错误

### 后端启动失败
1. 检查环境变量
2. 查看Render日志
3. 确认数据库连接

### 数据库连接失败
1. 检查DATABASE_URL格式
2. 确认IP白名单
3. 测试本地连接

---

## 升级付费 (可选)

如果免费额度不够:

| 平台 | 付费版 | 价格 | 提升 |
|------|--------|------|------|
| Vercel | Pro | $20/月 | 更多构建时间 |
| Render | Starter | $7/月 | 无休眠 |
| Railway | Hobby | $5/月 | 更多资源 |

---

## 一键部署脚本

### Windows (PowerShell)
```powershell
# 部署到Render
./scripts/deploy-render.ps1

# 部署到Vercel
./scripts/deploy-vercel.ps1
```

### Linux/Mac
```bash
# 部署到Render
./scripts/deploy-render.sh

# 部署到Vercel
./scripts/deploy-vercel.sh
```
