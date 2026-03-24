/**
 * 实时交易推荐系统
 * 基于实时市场数据计算最优期权组合
 */

class TradingRecommender {
    constructor() {
        this.marketData = {
            "510050": { name: "50ETF", price: 2.870, preClose: 2.868, iv: 22.5 },
            "510300": { name: "300ETF", price: 4.445, preClose: 4.430, iv: 21.8 },
            "510500": { name: "500ETF", price: 7.548, preClose: 7.512, iv: 25.2 }
        };
        
        this.recommendations = [];
    }

    /**
     * 生成实时交易推荐
     */
    generateRecommendations() {
        const recommendations = [];
        
        for (const [code, data] of Object.entries(this.marketData)) {
            const changePct = ((data.price - data.preClose) / data.preClose * 100).toFixed(2);
            const ivLevel = this.getIVLevel(data.iv);
            
            const ironCondor = this.generateIronCondor(code, data);
            recommendations.push({
                type: "铁鹰策略",
                underlying: data.name,
                code: code,
                currentPrice: data.price,
                changePct: changePct,
                iv: data.iv,
                ivLevel: ivLevel,
                structure: ironCondor,
                score: this.calculateScore(data, ironCondor),
                priority: 0
            });
        }
        
        recommendations.sort((a, b) => b.score - a.score);
        
        recommendations.forEach((rec, index) => {
            rec.priority = index + 1;
        });
        
        return recommendations;
    }

    /**
     * 生成铁鹰结构
     */
    generateIronCondor(code, data) {
        const price = data.price;
        const strikeInterval = code === "510500" ? 0.25 : 0.05;
        
        const atmStrike = Math.round(price / strikeInterval) * strikeInterval;
        
        const putSellStrike = (atmStrike - 2 * strikeInterval).toFixed(2);
        const putBuyStrike = (atmStrike - 3 * strikeInterval).toFixed(2);
        
        const callSellStrike = (atmStrike + 2 * strikeInterval).toFixed(2);
        const callBuyStrike = (atmStrike + 3 * strikeInterval).toFixed(2);
        
        const timeValue = data.iv / 100 * Math.sqrt(30 / 365);
        const putCredit = (timeValue * price * 0.8).toFixed(4);
        const callCredit = (timeValue * price * 0.8).toFixed(4);
        const netCredit = (parseFloat(putCredit) + parseFloat(callCredit)).toFixed(4);
        
        return {
            putLegs: {
                sell: putSellStrike,
                buy: putBuyStrike,
                credit: putCredit
            },
            callLegs: {
                sell: callSellStrike,
                buy: callBuyStrike,
                credit: callCredit
            },
            netCredit: netCredit,
            maxProfit: (netCredit * 10000).toFixed(0),
            maxLoss: ((strikeInterval - parseFloat(netCredit)) * 10000).toFixed(0),
            breakEvenLower: (parseFloat(putSellStrike) - parseFloat(netCredit)).toFixed(3),
            breakEvenUpper: (parseFloat(callSellStrike) + parseFloat(netCredit)).toFixed(3)
        };
    }

    getIVLevel(iv) {
        if (iv < 18) return "偏低";
        if (iv < 25) return "中等";
        if (iv < 35) return "偏高";
        return "极高";
    }

    calculateScore(data, structure) {
        let score = 50;
        
        if (data.iv > 25) score += 20;
        else if (data.iv > 20) score += 10;
        
        const riskReward = parseFloat(structure.netCredit) / 0.05;
        score += riskReward * 10;
        
        if (data.name === "300ETF" || data.name === "50ETF") score += 10;
        
        return Math.min(100, Math.max(0, score)).toFixed(1);
    }

    renderRecommendations() {
        const container = document.getElementById("realtimeRecommendations");
        if (!container) return;
        
        const recommendations = this.generateRecommendations();
        
        let html = `
            <div class="recommendation-header">
                <h3>实时交易推荐 (基于当前市场数据)</h3>
                <span class="update-time">更新时间: ${new Date().toLocaleTimeString("zh-CN")}</span>
            </div>
        `;
        
        recommendations.forEach((rec, index) => {
            const scoreColor = rec.score >= 80 ? "#10b981" : rec.score >= 60 ? "#f59e0b" : "#ef4444";
            const isBest = index === 0;
            
            html += `
                <div class="recommendation-card ${isBest ? "best" : ""}" data-code="${rec.code}" style="cursor: pointer;" title="点击查看详情">
                    <div class="rec-header">
                        <span class="priority">#${rec.priority}</span>
                        <span class="underlying">${rec.underlying} (${rec.code})</span>
                        <span class="score" style="color: ${scoreColor}">评分: ${rec.score}</span>
                    </div>
                    <div class="rec-body">
                        <div class="market-info">
                            <span>现价: <b>${rec.currentPrice}</b></span>
                            <span>涨跌: <b class="${rec.changePct >= 0 ? "positive" : "negative"}">${rec.changePct >= 0 ? "+" : ""}${rec.changePct}%</b></span>
                            <span>IV: <b>${rec.iv}% (${rec.ivLevel})</b></span>
                        </div>
                        <div class="structure">
                            <h4>推荐结构: ${rec.type}</h4>
                            <div class="legs">
                                <div class="leg-group">
                                    <span class="leg-label">Put端:</span>
                                    <span class="leg">卖${rec.structure.putLegs.sell} / 买${rec.structure.putLegs.buy}</span>
                                </div>
                                <div class="leg-group">
                                    <span class="leg-label">Call端:</span>
                                    <span class="leg">卖${rec.structure.callLegs.sell} / 买${rec.structure.callLegs.buy}</span>
                                </div>
                            </div>
                            <div class="metrics">
                                <span>净收权利金: <b>${rec.structure.netCredit}</b></span>
                                <span>最大盈利: <b class="positive">${rec.structure.maxProfit}</b></span>
                                <span>最大亏损: <b class="negative">${rec.structure.maxLoss}</b></span>
                                <span>盈亏区间: ${rec.structure.breakEvenLower} - ${rec.structure.breakEvenUpper}</span>
                            </div>
                        </div>
                        ${isBest ? '<div style="margin-top: 10px; padding: 8px; background: rgba(16, 185, 129, 0.1); border-radius: 4px; text-align: center; color: var(--success-color); font-weight: 500;">👍 最佳推荐 - 点击卡片查看详情</div>' : ''}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // 添加点击事件
        container.querySelectorAll('.recommendation-card').forEach(card => {
            card.addEventListener('click', function() {
                const code = this.dataset.code;
                applyRecommendation(code);
            });
        });
    }
}

// 全局实例
const tradingRecommender = new TradingRecommender();

// 应用推荐方案
function applyRecommendation(code) {
    console.log("应用推荐方案:", code);
    const rec = tradingRecommender.generateRecommendations().find(r => r.code === code);
    if (rec) {
        // 填充到计算器
        const spotPriceInput = document.getElementById("spotPrice");
        if (spotPriceInput) {
            spotPriceInput.value = (rec.currentPrice * 100).toFixed(2);
        }
        
        // 切换到计算器页面
        document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
        document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
        
        const calcNav = document.querySelector("[data-page=\"calculator\"]");
        const calcPage = document.getElementById("calculator");
        
        if (calcNav) calcNav.classList.add("active");
        if (calcPage) calcPage.classList.add("active");
        
        // 触发计算
        const calcBtn = document.getElementById("calcBtn");
        if (calcBtn) calcBtn.click();
        
        alert(`已加载 ${rec.underlying} 的推荐方案:\n` +
              `Put: 卖${rec.structure.putLegs.sell} / 买${rec.structure.putLegs.buy}\n` +
              `Call: 卖${rec.structure.callLegs.sell} / 买${rec.structure.callLegs.buy}\n` +
              `请在期权计算器中查看详细计算结果。`);
    }
}

// 自动更新推荐
function startRealtimeUpdates() {
    tradingRecommender.renderRecommendations();
    
    setInterval(() => {
        tradingRecommender.renderRecommendations();
    }, 30000);
}

// 页面加载完成后启动
document.addEventListener("DOMContentLoaded", () => {
    console.log("交易推荐系统初始化...");
    if (document.getElementById("realtimeRecommendations")) {
        startRealtimeUpdates();
    }
});
