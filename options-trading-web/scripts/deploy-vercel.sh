#!/bin/bash
echo "🚀 部署前端到Vercel..."

cd frontend

# 安装Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📥 安装Vercel CLI..."
    npm i -g vercel
fi

# 登录
vercel login

# 部署
vercel --prod

echo "✅ 部署完成!"
