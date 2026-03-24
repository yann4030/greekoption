Write-Host "🚀 开始部署到Render..." -ForegroundColor Green

# 检查Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 请先安装Git" -ForegroundColor Red
    exit 1
}

# 提交代码
Write-Host "📦 提交代码..." -ForegroundColor Yellow
git add .
git commit -m "Deploy to Render"
git push origin main

Write-Host "✅ 代码已推送到GitHub" -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 访问 https://dashboard.render.com"
Write-Host "2. 点击 'New +' → 'Web Service'"
Write-Host "3. 选择你的GitHub仓库"
Write-Host "4. 配置环境变量"
Write-Host "5. 点击部署"
Write-Host ""
Write-Host "📖 详细步骤见DEPLOY.md"
