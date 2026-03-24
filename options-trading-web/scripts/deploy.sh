#!/bin/bash
# 部署脚本

echo "🚀 开始部署期权交易平台..."

# 1. 构建前端
echo "📦 构建前端..."
cd frontend
npm install
npm run build
cd ..

# 2. 启动服务
echo "🐳 启动Docker服务..."
docker-compose down
docker-compose up -d --build

# 3. 检查状态
echo "✅ 检查服务状态..."
docker-compose ps

echo "🎉 部署完成！"
echo "访问: http://localhost"
echo "API文档: http://localhost/api/docs"
