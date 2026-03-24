# 手动修复package.json并推送

## 方法1: 直接在GitHub网站修改

1. 访问 https://github.com/yann4030/greekoption
2. 进入 `options-trading-web/frontend/package.json`
3. 点击右上角的 ✏️ **Edit** 按钮
4. 删除所有内容，粘贴下面的代码：

```json
{
  "name": "greekoption-frontend",
  "version": "4.0.0",
  "description": "GreekOption Frontend",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0",
    "element-plus": "^2.5.0",
    "echarts": "^5.4.0",
    "vue-echarts": "^6.6.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "@types/node": "^20.0.0"
  }
}
```

5. 点击 **"Commit changes"**
6. 填写提交信息: `fix package.json`
7. 选择 **"Commit directly to the master branch"**
8. 点击 **"Commit changes"**

## 方法2: 使用GitHub Desktop

1. 下载安装 GitHub Desktop: https://desktop.github.com
2. 登录你的 yann4030 账号
3. 打开 greekoption 仓库
4. 修改 package.json 文件
5. 提交并推送

## 方法3: 重新创建仓库

如果以上方法都失败：

1. 删除GitHub上的 greekoption 仓库
2. 重新创建
3. 重新推送代码

---

## 修复后

在Vercel点击 **"Redeploy"** 重新部署
