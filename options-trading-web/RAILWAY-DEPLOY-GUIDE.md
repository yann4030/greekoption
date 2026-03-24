# GreekOption - Railway部署步骤 (无需信用卡)

## 🚀 访问Railway
打开: https://railway.app

---

## 第一步: 登录 (1分钟)

1. 点击 **"Login"**
2. 选择 **"Continue with GitHub"**
3. 授权访问你的GitHub账号
4. 登录成功后会看到Dashboard

---

## 第二步: 创建项目 (2分钟)

1. 点击 **"New Project"** (绿色按钮)
2. 选择 **"Deploy from GitHub repo"**
3. 在列表中找到并点击 **"yann4030/greekoption"**
4. Railway会自动开始部署
5. 等待部署完成 (约2-3分钟)

---

## 第三步: 添加数据库 (2分钟)

### 添加PostgreSQL
1. 在项目页面，点击 **"New"** 按钮
2. 选择 **"Database"**
3. 选择 **"Add PostgreSQL"**
4. 等待创建完成 (约1分钟)

### 添加Redis
1. 再次点击 **"New"** 按钮
2. 选择 **"Database"**
3. 选择 **"Add Redis"**
4. 等待创建完成

---

## 第四步: 配置环境变量 (2分钟)

1. 点击你的服务 (显示greekoption的那个)
2. 点击顶部 **"Variables"** 标签
3. 点击 **"New Variable"** 添加以下变量:

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` |
| `SECRET_KEY` | `greekoption-secret-key-2024` (自己编一个) |
| `CORS_ORIGINS` | `https://greekoption.vercel.app` |

4. 点击 **Deploy** 重新部署

---

## 第五步: 获取域名 (1分钟)

1. 部署完成后，点击 **"Settings"** 标签
2. 找到 **Environment** 部分
3. 点击 **"Generate Domain"**
4. 域名格式: `https://greekoption-production.up.railway.app`
5. **复制这个域名，等会Vercel要用**

---

## 第六步: 验证部署

1. 访问: `https://greekoption-production.up.railway.app/health`
2. 应该显示: `{"status": "healthy"}`
3. 访问: `https://greekoption-production.up.railway.app/docs`
4. 应该显示API文档

---

## ✅ Railway部署完成！

**后端地址**: `https://greekoption-production.up.railway.app`

**现在继续部署前端到Vercel**

---

## 下一步: Vercel部署

1. 访问 https://vercel.com
2. 用GitHub登录
3. 导入 greekoption 项目
4. 环境变量:
   - `VITE_API_URL`: `https://greekoption-production.up.railway.app/api/v1`
5. 点击 Deploy
