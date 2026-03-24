Write-Host "🚀 部署前端到Vercel..." -ForegroundColor Green

Set-Location frontend

# 安装Vercel CLI
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📥 安装Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
}

# 登录
vercel login

# 部署
vercel --prod

Write-Host "✅ 部署完成!" -ForegroundColor Green
