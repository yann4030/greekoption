# 🎯 最终部署配置

## 项目名称
- **前端**: `yann-option-tools`
- **后端**: `yann-option-tools-api`
- **数据库**: `yann-option-tools-db`
- **Redis**: `yann-option-tools-redis`

## 部署后地址
- **前端**: https://yann-option-tools.vercel.app
- **后端**: https://yann-option-tools-api.onrender.com
- **API文档**: https://yann-option-tools-api.onrender.com/docs

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
   - Name: `yann-option-tools-api`
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 创建PostgreSQL数据库: `yann-option-tools-db`
6. 创建Redis: `yann-option-tools-redis`
7. 部署

### 3. 部署前端 (Vercel)
1. 访问 https://vercel.com
2. Add New Project
3. 选择GitHub仓库
4. 配置:
   - Framework: Vue.js
   - Root Directory: frontend
   - Build Command: npm run build
5. 环境变量:
   - `VITE_API_URL`: `https://yann-option-tools-api.onrender.com/api/v1`
6. 部署

## 免费额度
- Vercel: 无限流量
- Render: 750小时/月
- PostgreSQL: 1GB
- Redis: 25MB

## 状态检查
部署完成后访问:
- https://yann-option-tools.vercel.app (应该显示期权交易界面)
- https://yann-option-tools-api.onrender.com/health (应该显示healthy)
