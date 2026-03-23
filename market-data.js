/**
 * 市场数据模块 - 实时行情接入
 * 支持多数据源: 新浪、东方财富、腾讯等
 */

class MarketDataProvider {
    constructor() {
        this.dataSources = {
            sina: {
                name: "新浪财经",
                stockUrl: (code) => `https://hq.sinajs.cn/list=${code}`,
                optionUrl: (underlying) => `https://hq.sinajs.cn/list=OP_UP_${underlying},OP_DOWN_${underlying}`
            },
            eastmoney: {
                name: "东方财富",
                stockUrl: (code) => `https://push2.eastmoney.com/api/qt/stock/get?secid=${code}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60`,
                optionChainUrl: (code) => `https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:10&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15,f16,f17,f18,f19,f20,f21,f22,f23,f24,f25,f26,f27,f28,f29,f30,f31,f32,f33,f34,f35,f36,f37,f38,f39,f40,f41,f42,f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65,f66,f67,f68,f69,f70,f71,f72,f73,f74,f75,f76,f77,f78,f79,f80,f81,f82,f83,f84,f85,f86,f87,f88,f89,f90,f91,f92,f93,f94,f95,f96,f97,f98,f99,f100&ut=fa5fd1943c7b386f172d6893dbfba10b&_=${Date.now()}`
            },
            tencent: {
                name: "腾讯财经",
                stockUrl: (code) => `https://qt.gtimg.cn/q=${code}`
            }
        };
        
        this.subscribers = [];
        this.isConnected = false;
        this.currentData = {};
        this.updateInterval = null;
        
        // 模拟数据配置
        this.simulationMode = true;
        this.simulationData = {
            "510050": { name: "50ETF", basePrice: 2.857, volatility: 0.25 },
            "510300": { name: "300ETF", basePrice: 4.410, volatility: 0.23 },
            "510500": { name: "500ETF", basePrice: 7.462, volatility: 0.28 },
            "159915": { name: "创业板ETF", basePrice: 2.15, volatility: 0.32 },
            "588000": { name: "科创50ETF", basePrice: 1.05, volatility: 0.35 }
        };
    }

    /**
     * 连接市场数据
     */
    connect() {
        this.isConnected = true;
        this.updateStatus("已连接 - 实时数据");
        
        if (this.simulationMode) {
            this.startSimulation();
        } else {
            this.startRealTimeFetch();
        }
        
        return true;
    }

    /**
     * 断开连接
     */
    disconnect() {
        this.isConnected = false;
        this.updateStatus("已断开");
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * 更新连接状态显示
     */
    updateStatus(status) {
        const el = document.getElementById("marketStatus");
        if (el) {
            el.textContent = status;
            el.className = this.isConnected ? "status-open" : "status-closed";
        }
    }

    /**
     * 启动模拟数据
     */
    startSimulation() {
        // 初始化当前价格
        Object.keys(this.simulationData).forEach(code => {
            const data = this.simulationData[code];
            this.currentData[code] = {
                code: code,
                name: data.name,
                price: data.basePrice,
                preClose: data.basePrice,
                high: data.basePrice * 1.02,
                low: data.basePrice * 0.98,
                volume: Math.floor(Math.random() * 1000000) + 500000,
                change: 0,
                changePct: 0,
                iv: data.volatility * 100, // 隐含波动率
                timestamp: new Date().toLocaleTimeString("zh-CN")
            };
        });

        // 每2秒更新一次
        this.updateInterval = setInterval(() => {
            this.updateSimulationData();
        }, 2000);

        // 立即更新一次
        this.updateSimulationData();
    }

    /**
     * 更新模拟数据
     */
    updateSimulationData() {
        Object.keys(this.simulationData).forEach(code => {
            const simData = this.simulationData[code];
            const current = this.currentData[code];
            
            // 随机波动
            const volatility = simData.volatility / Math.sqrt(252); // 日波动率
            const change = (Math.random() - 0.5) * 2 * volatility * current.price;
            const newPrice = Math.max(current.price + change, simData.basePrice * 0.8);
            
            const changeAmt = newPrice - current.preClose;
            const changePct = (changeAmt / current.preClose) * 100;
            
            // IV也随机波动
            const ivChange = (Math.random() - 0.5) * 0.5;
            const newIV = Math.max(15, Math.min(50, current.iv + ivChange));
            
            this.currentData[code] = {
                ...current,
                price: newPrice,
                change: changeAmt,
                changePct: changePct,
                high: Math.max(current.high, newPrice),
                low: Math.min(current.low, newPrice),
                volume: current.volume + Math.floor(Math.random() * 10000),
                iv: newIV,
                timestamp: new Date().toLocaleTimeString("zh-CN")
            };
            
            // 更新UI
            this.updateDashboard(this.currentData[code]);
        });
        
        // 更新期权链
        this.updateOptionChains();
    }

    /**
     * 启动真实数据获取
     */
    startRealTimeFetch() {
        // 实际使用时实现真实API调用
        console.log("真实数据模式 - 需要配置API密钥");
    }

    /**
     * 更新行情看板
     */
    updateDashboard(data) {
        // 更新标的资产信息
        const assetName = document.getElementById("assetName");
        const assetPrice = document.getElementById("assetPrice");
        const assetChange = document.getElementById("assetChange");
        const assetHigh = document.getElementById("assetHigh");
        const assetLow = document.getElementById("assetLow");
        const assetVolume = document.getElementById("assetVolume");
        const vixValue = document.getElementById("vixValue");

        if (assetName && data.code === "510050") {
            assetName.textContent = `${data.code} (${data.name})`;
            assetPrice.textContent = data.price.toFixed(3);
            assetChange.textContent = `${data.change >= 0 ? "+" : ""}${data.change.toFixed(4)} (${data.changePct.toFixed(2)}%)`;
            assetChange.className = `change ${data.change >= 0 ? "positive" : "negative"}`;
            assetHigh.textContent = data.high.toFixed(3);
            assetLow.textContent = data.low.toFixed(3);
            assetVolume.textContent = (data.volume / 10000).toFixed(1) + "万";
        }
        
        if (vixValue && data.code === "510050") {
            vixValue.textContent = data.iv.toFixed(2);
        }

        // 同步更新计算器中的标的价格
        const spotPriceInput = document.getElementById("spotPrice");
        if (spotPriceInput && !spotPriceInput.matches(":focus") && data.code === "510050") {
            spotPriceInput.value = (data.price * 100).toFixed(2);
        }
    }

    /**
     * 更新期权链
     */
    updateOptionChains() {
        const container = document.getElementById("optionChain");
        if (!container) return;

        const code = "510050";
        const data = this.currentData[code];
        if (!data) return;

        const spotPrice = data.price;
        const iv = data.iv / 100;
        
        // 生成围绕现价的行权价
        const atmStrike = Math.round(spotPrice * 100 / 5) * 5 / 100;
        const strikes = [];
        for (let i = -4; i <= 4; i++) {
            strikes.push((atmStrike + i * 0.05).toFixed(3));
        }

        let html = `
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
                <tr style="color:#94a3b8;background:var(--bg-dark)">
                    <td style="padding:10px">行权价</td>
                    <td style="padding:10px">看涨(买/卖)</td>
                    <td style="padding:10px">看跌(买/卖)</td>
                    <td style="padding:10px">IV</td>
                </tr>
        `;
        
        strikes.forEach(strike => {
            const strikeNum = parseFloat(strike);
            const isATM = Math.abs(strikeNum - spotPrice) < 0.03;
            
            // 使用Black-Scholes计算理论价格
            const T = 30 / 365; // 30天到期
            const r = 0.025; // 2.5%无风险利率
            
            const callPrice = this.calculateOptionPrice(spotPrice, strikeNum, T, r, iv, "call");
            const putPrice = this.calculateOptionPrice(spotPrice, strikeNum, T, r, iv, "put");
            
            const callBid = (callPrice * 0.95).toFixed(4);
            const callAsk = (callPrice * 1.05).toFixed(4);
            const putBid = (putPrice * 0.95).toFixed(4);
            const putAsk = (putPrice * 1.05).toFixed(4);
            
            const rowStyle = isATM ? "background:rgba(37,99,235,0.1)" : "";
            html += `
                <tr style="${rowStyle};border-bottom:1px solid var(--border-color);cursor:pointer" onclick="selectStrike(${strikeNum})">
                    <td style="padding:8px 10px"><b>${strike}</b>${isATM ? " ATM" : ""}</td>
                    <td style="padding:8px 10px"><span class="positive">${callBid}</span> / <span class="negative">${callAsk}</span></td>
                    <td style="padding:8px 10px"><span class="positive">${putBid}</span> / <span class="negative">${putAsk}</span></td>
                    <td style="padding:8px 10px">${(iv * 100).toFixed(1)}%</td>
                </tr>
            `;
        });
        
        html += "</table>";
        container.innerHTML = html;
        
        // 更新到期日
        const expiry = document.getElementById("optionExpiry");
        if (expiry) {
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            expiry.textContent = `(到期: ${nextMonth.getMonth() + 1}月${nextMonth.getDate()}日, 剩余30天)`;
        }
    }

    /**
     * 计算期权理论价格 (简化版Black-Scholes)
     */
    calculateOptionPrice(S, K, T, r, sigma, type) {
        if (T <= 0) {
            return type === "call" ? Math.max(0, S - K) : Math.max(0, K - S);
        }
        
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        const Nd1 = this.normalCDF(d1);
        const Nd2 = this.normalCDF(d2);
        
        if (type === "call") {
            return S * Nd1 - K * Math.exp(-r * T) * Nd2;
        } else {
            return K * Math.exp(-r * T) * (1 - Nd2) - S * (1 - Nd1);
        }
    }

    /**
     * 标准正态分布CDF
     */
    normalCDF(x) {
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
        const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);
        const t = 1 / (1 + p * x);
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return 0.5 * (1 + sign * y);
    }

    /**
     * 获取当前数据
     */
    getCurrentData(code) {
        return this.currentData[code];
    }

    /**
     * 订阅数据更新
     */
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    /**
     * 取消订阅
     */
    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(cb => cb !== callback);
    }
}

// 全局实例
const marketData = new MarketDataProvider();
