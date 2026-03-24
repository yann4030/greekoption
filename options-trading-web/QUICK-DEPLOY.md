# 🚀 3分钟部署到免费云端

## 推荐方案: Vercel + Render (最稳定)

### 1. 准备代码 (1分钟)
```bash
# 确保代码已提交到GitHub
git push origin main
```

### 2. 部署后端到Render (1分钟)
1. 访问 https://render.com → 用GitHub登录
2. 点击 "New +" → "Web Service"
3. 选择你的仓库
4. 配置:
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 点击 "Create Web Service"
6. 等待部署完成，复制URL

### 3. 部署前端到Vercel (1分钟)
1. 访问 https://vercel.com → 用GitHub登录
2. 点击 "Add New Project"
3. 选择你的仓库
4. 配置:
   - Framework: Vue.js
   - Root: frontend
   - Build: npm run build
5. 环境变量: `VITE_API_URL=https://你的render地址/api/v1`
6. 点击 "Deploy"

---

## 免费额度

| 服务 | 免费额度 | 说明 |
|------|----------|------|
| Vercel | 无限流量 | 前端托管 |
| Render | 750小时/月 | 后端服务 |
| PostgreSQL | 1GB | 数据库 |
| Redis | 25MB | 缓存 |

---

## 部署后地址

- 前端: `https://你的项目.vercel.app`
- 后端: `https://你的项目.onrender.com`
- API文档: `https://你的项目.onrender.com/docs`

---

## 备选方案

### Railway (最简单)
- 访问 https://railway.app
- 一键部署，自动配置数据库

### Fly.io (全球最快)
- 访问 https://fly.io
- 全球多区域部署

---

## 需要帮助?

查看完整指南: `DEPLOY.md`
