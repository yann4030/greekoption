# 🎯 GreekOption - 最终部署配置

## 项目名称
- **前端**: `greekoption`
- **后端**: `greekoption-api`
- **数据库**: `greekoption-db`
- **Redis**: `greekoption-redis`

## 部署后地址
- **前端**: https://greekoption.vercel.app
- **后端**: https://greekoption-api.onrender.com
- **API文档**: https://greekoption-api.onrender.com/docs

## 品牌含义
GreekOption = Greeks + Option
- 突出期权Greeks风险分析核心功能
- 专业、简洁、易记
- 适合量化交易者

## 部署步骤

### 1. 提交代码
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. 部署后端 (Render)
1. 访问 https://render.com
2. New + → Web Service
3. 选择GitHub仓库
4. 配置:
   - Name: `greekoption-api`
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 创建PostgreSQL数据库: `greekoption-db`
6. 创建Redis: `greekoption-redis`
7. 点击 "Create Web Service"

### 3. 部署前端 (Vercel)
1. 访问 https://vercel.com
2. Add New Project
3. 选择GitHub仓库
4. 配置:
   - Framework: Vue.js
   - Root Directory: frontend
   - Build Command: npm run build
5. 环境变量:
   - `VITE_API_URL`: `https://greekoption-api.onrender.com/api/v1`
6. 点击 Deploy

## 部署验证
部署完成后访问:
- https://greekoption.vercel.app (期权交易界面)
- https://greekoption-api.onrender.com/health (健康检查)

## 免费额度
- Vercel: 无限流量
- Render: 750小时/月
- PostgreSQL: 1GB
- Redis: 25MB
