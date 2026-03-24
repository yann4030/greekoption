# GreekOption 超详细部署步骤

## 📋 部署前准备

### 需要的账号
1. **GitHub账号** (代码托管) - https://github.com
2. **Render账号** (后端+数据库) - https://render.com  
3. **Vercel账号** (前端) - https://vercel.com

---

## 第一步: 推送代码到GitHub (5分钟)

### 1.1 创建GitHub仓库
1. 访问 https://github.com/new
2. Repository name: `greekoption`
3. Description: `期权交易平台 - GreekOption`
4. 选择 **Public** (免费)
5. 点击 **Create repository**

### 1.2 上传代码
```bash
cd "D:\AutoClaw\002.Prj\options-trading-gui"
git init
git add .
git commit -m "GreekOption v1.0 - 期权交易平台"
git remote add origin https://github.com/YOUR_USERNAME/greekoption.git
git push -u origin main
```

---

## 第二步: 部署后端到Render (10分钟)

### 2.1 登录Render
- 访问 https://dashboard.render.com
- 用GitHub登录

### 2.2 创建PostgreSQL数据库
1. New + → PostgreSQL
2. Name: `greekoption-db`
3. Database: `greekoption`
4. User: `greekoption_user`
5. 点击 Create
6. 复制 Internal Connection String

### 2.3 创建Redis
1. New + → Redis
2. Name: `greekoption-redis`
3. 点击 Create

### 2.4 部署Web服务
1. New + → Web Service
2. 选择 `greekoption` 仓库
3. 配置:
   - Name: `greekoption-api`
   - Region: Singapore
   - Runtime: Python 3
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. 环境变量:
   - DATABASE_URL: [从PostgreSQL复制]
   - REDIS_URL: [从Redis复制]
   - SECRET_KEY: [点击Generate]
   - CORS_ORIGINS: `https://greekoption.vercel.app`
5. 点击 Create Web Service

---

## 第三步: 部署前端到Vercel (5分钟)

### 3.1 登录Vercel
- 访问 https://vercel.com
- 用GitHub登录

### 3.2 导入项目
1. Add New Project
2. 选择 `greekoption` 仓库
3. 点击 Import

### 3.3 配置项目
- Framework: Vue.js
- Root Directory: `frontend`
- Build: `npm run build`
- Output: `dist`

### 3.4 环境变量
- Name: `VITE_API_URL`
- Value: `https://greekoption-api.onrender.com/api/v1`

### 3.5 部署
- 点击 Deploy
- 等待完成

---

## 验证部署

### 后端验证
访问: https://greekoption-api.onrender.com/health
应该显示: {"status": "healthy"}

### 前端验证  
访问: https://greekoption.vercel.app
应该显示登录界面

---

## 常见问题

### 问题1: 前端无法连接后端
解决: 检查Render的CORS_ORIGINS环境变量是否包含前端地址

### 问题2: 数据库连接失败
解决: 检查DATABASE_URL格式，确保是 postgresql:// 开头

### 问题3: 页面空白
解决: 查看Vercel部署日志，检查是否有构建错误
