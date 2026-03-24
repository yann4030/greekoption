# 部署脚本 (Windows)
Write-Host "🚀 开始部署期权交易平台..." -ForegroundColor Green

# 1. 构建前端
Write-Host "📦 构建前端..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Set-Location ..

# 2. 启动服务
Write-Host "🐳 启动Docker服务..." -ForegroundColor Yellow
docker-compose down
docker-compose up -d --build

# 3. 检查状态
Write-Host "✅ 检查服务状态..." -ForegroundColor Green
docker-compose ps

Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host "访问: http://localhost"
Write-Host "API文档: http://localhost/api/docs"
