# 域名被占用解决方案

## 问题
`options-trading.vercel.app` 已被其他项目占用

## 解决方案

### 方案1: 使用不同的项目名称 (推荐)

在Vercel部署时，使用以下替代名称：

**前端项目名称建议：**
- `option-strategy-gui`
- `option-tools-app`
- `option-analyzer`
- `option-calculator-web`
- `50etf-options`
- `a-share-options`
- `option-trading-assistant`
- `volatility-trader`

**后端项目名称建议：**
- `option-strategy-api`
- `option-tools-api`
- `option-analyzer-api`

---

### 方案2: 使用自定义域名 (推荐长期使用)

#### 免费域名获取
1. **Freenom** (免费域名)
   - 访问 https://freenom.com
   - 注册免费域名: `yourname.tk` / `yourname.ml`
   - 添加到Vercel

2. **Cloudflare Pages** (自带域名)
   - 使用 `yourname.pages.dev`

#### 配置步骤
1. 在Vercel项目设置中添加自定义域名
2. 在域名DNS中添加CNAME记录指向Vercel
3. 自动获得SSL证书

---

### 方案3: 使用其他平台

| 平台 | 默认域名格式 | 特点 |
|------|-------------|------|
| **Netlify** | `yourname.netlify.app` | 稳定免费 |
| **Cloudflare Pages** | `yourname.pages.dev` | 全球CDN |
| **Surge.sh** | `yourname.surge.sh` | 简单快速 |
| **GitHub Pages** | `username.github.io/repo` | 代码托管一体 |

---

## 推荐配置

### 前端 (Vercel)
```
项目名称: option-strategy-gui
域名: https://option-strategy-gui.vercel.app
```

### 后端 (Render)
```
项目名称: option-strategy-api
域名: https://option-strategy-api.onrender.com
```

### 环境变量
```
VITE_API_URL=https://option-strategy-api.onrender.com/api/v1
```

---

## 检查域名是否可用

部署前可以在Vercel创建项目时检查：
1. 输入项目名称
2. 如果显示绿色✓则可用
3. 如果显示红色✗则已被占用

---

## 我的建议

**短期测试**: 使用 `option-strategy-gui` 或 `option-tools-app`

**长期使用**: 
1. 购买一个域名 (约50元/年)
2. 或使用 Freenom 免费域名
3. 配置到Vercel

这样域名就是永久的，不用担心被占用。
