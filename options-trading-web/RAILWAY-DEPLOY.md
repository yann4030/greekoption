# Railway部署指南 (免费，无需信用卡)

## 为什么选择Railway？
- ✅ 完全免费 ($5/月额度)
- ✅ 无需信用卡
- ✅ 一键部署
- ✅ 自动配置数据库

---

## 部署步骤

### 1. 注册Railway
1. 访问 https://railway.app
2. 点击 "Login" → "Continue with GitHub"
3. 用GitHub账号登录

### 2. 创建项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择 `yann4030/greekoption`
4. Railway自动检测并部署

### 3. 添加数据库
1. 在项目页面点击 "New"
2. 选择 "Database" → "Add PostgreSQL"
3. 再次点击 "New"
4. 选择 "Database" → "Add Redis"

### 4. 配置环境变量
1. 点击服务项目
2. 选择 "Variables" 标签
3. 添加:
   - `DATABASE_URL`: ${{Postgres.DATABASE_URL}}
   - `REDIS_URL`: ${{Redis.REDIS_URL}}
   - `SECRET_KEY`: [随机生成]
   - `CORS_ORIGINS`: `https://greekoption.vercel.app`

### 5. 获取域名
部署完成后，Railway会分配域名:
- `https://greekoption-production.up.railway.app`

---

## 备选方案: Fly.io

### 特点
- 免费额度充足
- 需要信用卡验证（不扣费）
- 全球多区域

### 部署
```bash
# 安装Fly CLI
winget install Fly-io.flyctl

# 登录
fly auth login

# 创建应用
fly launch --name greekoption

# 创建数据库
fly postgres create --name greekoption-db

# 部署
fly deploy
```

---

## 推荐方案

| 平台 | 需要信用卡 | 免费额度 | 难度 |
|------|-----------|----------|------|
| **Railway** | ❌ 不需要 | $5/月 | ⭐⭐ 简单 |
| Render | ✅ 需要 | 750小时 | ⭐⭐⭐ 中等 |
| Fly.io | ⚠️ 验证不扣费 |  generous | ⭐⭐⭐ 中等 |

---

## 我的建议

**用 Railway！**
- 完全免费
- 无需信用卡
- 5分钟部署完成
