#!/bin/bash
# 部署后端到Render

echo "🚀 开始部署到Render..."

# 检查环境
if ! command -v git &> /dev/null; then
    echo "❌ 请先安装Git"
    exit 1
fi

# 提交代码
echo "📦 提交代码..."
git add .
git commit -m "Deploy to Render"
git push origin main

echo "✅ 代码已推送到GitHub"
echo ""
echo "下一步:"
echo "1. 访问 https://dashboard.render.com"
echo "2. 点击 'New +' → 'Web Service'"
echo "3. 选择你的GitHub仓库"
echo "4. 配置环境变量"
echo "5. 点击部署"
echo ""
echo "📖 详细步骤见DEPLOY.md"
