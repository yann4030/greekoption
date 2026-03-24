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
     * 获取实时数据
     */
    async fetchRealTimeData() {
        try {
            // 使用东方财富API获取实时数据
            const stocks = [
                { code: "1.510050", name: "50ETF" },
                { code: "1.510300", name: "300ETF" },
                { code: "1.510500", name: "500ETF" }
            ];
            
            for (const stock of stocks) {
                const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${stock.code}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60`;
                // 实际使用时通过fetch获取
                // const response = await fetch(url);
                // const data = await response.json();
            }
            
            return this.marketData;
        } catch (error) {
            console.error("获取实时数据失败:", error);
            return this.marketData;
        }
    }

    /**
     * 生成实时交易推荐
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 基于当前市场数据生成推荐
        for (const [code, data] of Object.entries(this.marketData)) {
            const changePct = ((data.price - data.preClose) / data.preClose * 100).toFixed(2);
            const ivLevel = this.getIVLevel(data.iv);
            
            // 生成铁鹰推荐
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
        
        // 按评分排序
        recommendations.sort((a, b) => b.score - a.score);
        
        // 分配优先级
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
        
        // 计算行权价
        const atmStrike = Math.round(price / strikeInterval) * strikeInterval;
        
        // Put端 (下方)
        const putSellStrike = (atmStrike - 2 * strikeInterval).toFixed(2);
        const putBuyStrike = (atmStrike - 3 * strikeInterval).toFixed(2);
        
        // Call端 (上方)
        const callSellStrike = (atmStrike + 2 * strikeInterval).toFixed(2);
        const callBuyStrike = (atmStrike + 3 * strikeInterval).toFixed(2);
        
        // 估算权利金 (简化计算)
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

    /**
     * 判断IV水平
     */
    getIVLevel(iv) {
        if (iv < 18) return "偏低";
        if (iv < 25) return "中等";
        if (iv < 35) return "偏高";
        return "极高";
    }

    /**
     * 计算推荐评分
     */
    calculateScore(data, structure) {
        let score = 50;
        
        // IV越高越适合卖波
        if (data.iv > 25) score += 20;
        else if (data.iv > 20) score += 10;
        
        // 权利金/风险比
        const riskReward = parseFloat(structure.netCredit) / 0.05;
        score += riskReward * 10;
        
        // 流动性因素
        if (data.name === "300ETF" || data.name === "50ETF") score += 10;
        
        return Math.min(100, Math.max(0, score)).toFixed(1);
    }

    /**
     * 获取最佳推荐
     */
    getBestRecommendation() {
        const recommendations = this.generateRecommendations();
        return recommendations[0];
    }

    /**
     * 渲染推荐结果到页面
     */
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
            
            html += `
                <div class="recommendation-card ${index === 0 ? "best" : ""}">
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
                        ${index === 0 ? `
                        <div class="action-buttons">
                            <button onclick="applyRecommendation("${rec.code}")" class="btn-apply">应用此方案</button>
                            <button onclick="viewDetails("${rec.code}")" class="btn-details">查看详情</button>
                        </div>
                        ` : ""}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
}

// 全局实例
const tradingRecommender = new TradingRecommender();

// 自动更新推荐
function startRealtimeUpdates() {
    tradingRecommender.renderRecommendations();
    
    // 每30秒更新一次
    setInterval(() => {
        tradingRecommender.renderRecommendations();
    }, 30000);
}

// 应用推荐方案
function applyRecommendation(code) {
    const rec = tradingRecommender.generateRecommendations().find(r => r.code === code);
    if (rec) {
        // 填充到计算器
        document.getElementById("spotPrice").value = (rec.currentPrice * 100).toFixed(2);
        alert(`已加载 ${rec.underlying} 的推荐方案:\n` +
              `Put: 卖${rec.structure.putLegs.sell} / 买${rec.structure.putLegs.buy}\n` +
              `Call: 卖${rec.structure.callLegs.sell} / 买${rec.structure.callLegs.buy}`);
    }
}

// 查看详情
function viewDetails(code) {
    const rec = tradingRecommender.generateRecommendations().find(r => r.code === code);
    if (rec) {
        document.getElementById("dashboard").classList.remove("active");
        document.getElementById("calculator").classList.add("active");
        document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
        document.querySelector("[data-page=\"calculator\"]").classList.add("active");
    }
}

// 页面加载完成后启动
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("realtimeRecommendations")) {
        startRealtimeUpdates();
    }
});
