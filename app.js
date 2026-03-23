// 鏈熸潈浜ゆ槗GUI - 涓诲簲鐢ㄨ剼鏈?// 鍖呭惈: Black-Scholes瀹氫环銆丟reeks璁＄畻銆佺瓥鐣ョ泩浜忓垎鏋愩€佸疄鏃舵暟鎹帴鍏?
// ==================== 宸ュ叿鍑芥暟 ====================
function normalCDF(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
}

function normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// ==================== Black-Scholes 妯″瀷 ====================
function blackScholes(S, K, T, r, sigma, type = "call") {
    if (T <= 0) {
        const payoff = type === "call" ? Math.max(0, S - K) : Math.max(0, K - S);
        return { price: payoff, delta: type === "call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0 };
    }
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    const Nd1 = normalCDF(d1), Nd2 = normalCDF(d2), Npd1 = normalPDF(d1);
    let price, delta, rho;
    if (type === "call") {
        price = S * Nd1 - K * Math.exp(-r * T) * Nd2;
        delta = Nd1;
        rho = K * T * Math.exp(-r * T) * Nd2 / 100;
    } else {
        price = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
        delta = Nd1 - 1;
        rho = -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;
    }
    const gamma = Npd1 / (S * sigma * Math.sqrt(T));
    const vega = S * Npd1 * Math.sqrt(T) / 100;
    let theta = -(S * Npd1 * sigma) / (2 * Math.sqrt(T));
    if (type === "call") theta -= r * K * Math.exp(-r * T) * Nd2;
    else theta += r * K * Math.exp(-r * T) * normalCDF(-d2);
    theta = theta / 365;
    return { price, delta, gamma, theta, vega, rho };
}

// ==================== 瀹炴椂鏁版嵁鎺ュ叆 ====================
// 浣跨敤涓滄柟璐㈠瘜/鏂版氮绛夊厤璐笰PI鑾峰彇瀹炴椂琛屾儏
const DATA_SOURCES = {
    // 鏂版氮鑲＄エAPI
    sina: (code) => `https://hq.sinajs.cn/list=${code}`,
    // 涓滄柟璐㈠瘜鏈熸潈API
    eastmoney: (code) => `https://push2.eastmoney.com/api/qt/stock/get?secid=${code}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f60`,
    // 鏈熸潈閾炬暟鎹?    optionChain: (underlying) => `https://hq.sinajs.cn/list=OP_UP_${underlying},OP_DOWN_${underlying}`
};

// 妯℃嫙瀹炴椂鏁版嵁锛堝疄闄呬娇鐢ㄦ椂鏇挎崲涓虹湡瀹濧PI锛?class MarketDataProvider {
    constructor() {
        this.subscribers = [];
        this.isConnected = false;
        this.simulationInterval = null;
    }

    // 杩炴帴甯傚満鏁版嵁
    connect() {
        this.isConnected = true;
        document.getElementById("marketStatus").textContent = "瀹炴椂杩炴帴涓?;
        document.getElementById("marketStatus").className = "status-open";
        this.startSimulation();
        return true;
    }

    // 鏂紑杩炴帴
    disconnect() {
        this.isConnected = false;
        document.getElementById("marketStatus").textContent = "宸叉柇寮€";
        document.getElementById("marketStatus").className = "status-closed";
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
    }

    // 妯℃嫙瀹炴椂鏁版嵁鏇存柊
    startSimulation() {
        // 妯℃嫙50ETF鏁版嵁
        let basePrice = 2.650;
        this.simulationInterval = setInterval(() => {
            if (!this.isConnected) return;
            
            // 闅忔満娉㈠姩
            const change = (Math.random() - 0.5) * 0.01;
            basePrice += change;
            const changePct = (change / basePrice * 100).toFixed(2);
            
            const data = {
                code: "510050",
                name: "50ETF",
                price: basePrice.toFixed(3),
                change: change.toFixed(4),
                changePct: changePct,
                high: (basePrice + 0.02).toFixed(3),
                low: (basePrice - 0.02).toFixed(3),
                volume: Math.floor(Math.random() * 1000000) + 500000,
                timestamp: new Date().toLocaleTimeString("zh-CN")
            };
            
            this.updateDashboard(data);
            this.updateOptionChain(basePrice);
        }, 2000);
    }

    // 鏇存柊琛屾儏鐪嬫澘
    updateDashboard(data) {
        const assetName = document.getElementById("assetName");
        const assetPrice = document.getElementById("assetPrice");
        const assetChange = document.getElementById("assetChange");
        const assetHigh = document.getElementById("assetHigh");
        const assetLow = document.getElementById("assetLow");
        const assetVolume = document.getElementById("assetVolume");

        if (assetName) assetName.textContent = `${data.code} (${data.name})`;
        if (assetPrice) assetPrice.textContent = data.price;
        if (assetChange) {
            assetChange.textContent = `${data.change > 0 ? "+" : ""}${data.change} (${data.changePct}%)`;
            assetChange.className = `change ${data.change >= 0 ? "positive" : "negative"}`;
        }
        if (assetHigh) assetHigh.textContent = data.high;
        if (assetLow) assetLow.textContent = data.low;
        if (assetVolume) assetVolume.textContent = (data.volume / 10000).toFixed(1) + "涓?;
        
        // 鍚屾鏇存柊璁＄畻鍣ㄤ腑鐨勬爣鐨勪环鏍?        const spotPriceInput = document.getElementById("spotPrice");
        if (spotPriceInput && !spotPriceInput.matches(":focus")) {
            spotPriceInput.value = (parseFloat(data.price) * 100).toFixed(2); // 杞崲涓虹偣鏁?        }
    }

    // 鏇存柊鏈熸潈閾?    updateOptionChain(spotPrice) {
        const container = document.getElementById("optionChain");
        if (!container) return;

        // 鐢熸垚鍥寸粫鐜颁环鐨勮鏉冧环
        const atmStrike = Math.round(spotPrice * 100 / 5) * 5 / 100; // 鍙栨暣鍒?.05
        const strikes = [];
        for (let i = -4; i <= 4; i++) {
            strikes.push((atmStrike + i * 0.05).toFixed(3));
        }

        let html = "";
        strikes.forEach(strike => {
            const strikeNum = parseFloat(strike);
            const isATM = Math.abs(strikeNum - spotPrice) < 0.03;
            
            // 妯℃嫙鏈熸潈浠锋牸
            const intrinsicCall = Math.max(0, spotPrice - strikeNum);
            const intrinsicPut = Math.max(0, strikeNum - spotPrice);
            const timeValue = 0.02 + Math.random() * 0.03;
            
            const callPrice = (intrinsicCall + timeValue).toFixed(4);
            const putPrice = (intrinsicPut + timeValue).toFixed(4);
            const callBid = (parseFloat(callPrice) - 0.001).toFixed(4);
            const callAsk = (parseFloat(callPrice) + 0.001).toFixed(4);
            const putBid = (parseFloat(putPrice) - 0.001).toFixed(4);
            const putAsk = (parseFloat(putPrice) + 0.001).toFixed(4);
            
            const rowClass = isATM ? "option-row atm" : "option-row";
            html += `<div class="${rowClass}" onclick="selectStrike(${strikeNum})">
                <span><b>${strike}</b></span>
                <span><span class="positive">${callBid}</span> / <span class="negative">${callAsk}</span></span>
                <span><span class="positive">${putBid}</span> / <span class="negative">${putAsk}</span></span>
            </div>`;
        });
        
        container.innerHTML = html;
        
        // 鏇存柊鍒版湡鏃?        const expiry = document.getElementById("optionExpiry");
        if (expiry) {
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            expiry.textContent = `(鍒版湡: ${nextMonth.getMonth() + 1}鏈?{nextMonth.getDate()}鏃?`;
        }
    }
}

// 鍏ㄥ眬甯傚満鏁版嵁瀹炰緥
const marketData = new MarketDataProvider();

// 閫夋嫨琛屾潈浠?function selectStrike(strike) {
    const strikeInput = document.getElementById("strikePrice");
    if (strikeInput) {
        strikeInput.value = (strike * 100).toFixed(2);
        // 鑷姩鍒囨崲鍒拌绠楀櫒椤甸潰
        document.querySelector('[data-page="calculator"]').click();
        // 瑙﹀彂璁＄畻
        document.getElementById("calcBtn").click();
    }
}

// ==================== 椤甸潰瀵艰埅 ====================
function initNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetPage = item.dataset.page;
            document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
            document.getElementById(targetPage).classList.add("active");
        });
    });
}

// ==================== 鏈熸潈璁＄畻鍣?====================
function initCalculator() {
    const calcBtn = document.getElementById("calcBtn");
    if (!calcBtn) return;
    
    calcBtn.addEventListener("click", () => {
        const S = parseFloat(document.getElementById("spotPrice").value);
        const K = parseFloat(document.getElementById("strikePrice").value);
        const T = parseFloat(document.getElementById("timeToExpiry").value);
        const r = parseFloat(document.getElementById("riskFreeRate").value) / 100;
        const sigma = parseFloat(document.getElementById("volatility").value) / 100;
        const type = document.getElementById("optionType").value;
        
        const result = blackScholes(S, K, T, r, sigma, type);
        
        document.getElementById("optionPrice").textContent = result.price.toFixed(4);
        document.getElementById("delta").textContent = result.delta.toFixed(4);
        document.getElementById("gamma").textContent = result.gamma.toFixed(4);
        document.getElementById("theta").textContent = result.theta.toFixed(4);
        document.getElementById("vega").textContent = result.vega.toFixed(4);
        document.getElementById("rho").textContent = result.rho.toFixed(4);
    });
    
    calcBtn.click();
}

// ==================== 绛栫暐鍒嗘瀽 ====================
const STRATEGY_DESCRIPTIONS = {
    "long-call": "涔板叆鐪嬫定鏈熸潈锛氱湅娑ㄧ瓥鐣ワ紝鏈€澶т簭鎹熶负鏉冨埄閲戯紝娼滃湪鏀剁泭鏃犻檺銆傞€傚悎棰勬湡鏍囩殑澶у箙涓婃定鏃朵娇鐢ㄣ€?,
    "long-put": "涔板叆鐪嬭穼鏈熸潈锛氱湅璺岀瓥鐣ワ紝鏈€澶т簭鎹熶负鏉冨埄閲戯紝娼滃湪鏀剁泭鏈夐檺锛堟爣鐨勪环鏍艰穼鑷?锛夈€傞€傚悎棰勬湡鏍囩殑澶у箙涓嬭穼鏃朵娇鐢ㄣ€?,
    "covered-call": "澶囧厬鐪嬫定锛氭寔鏈夋爣鐨勮祫浜у悓鏃跺崠鍑虹湅娑ㄦ湡鏉冦€傞€氳繃鏀跺彇鏉冨埄閲戝寮烘敹鐩婏紝浣嗕笂娑ㄧ┖闂村彈闄愩€傞€傚悎娓╁拰鐪嬫定鎴栨í鐩樺競鍦恒€?,
    "protective-put": "淇濇姢鎬х湅璺岋細鎸佹湁鏍囩殑璧勪骇鍚屾椂涔板叆鐪嬭穼鏈熸潈銆備负鎸佷粨鎻愪緵涓嬭穼淇濇姢锛岀浉褰撲簬璐拱淇濋櫓銆?,
    "bull-call": "鐗涘競鐪嬫定浠峰樊锛氫拱鍏ヤ綆琛屾潈浠风湅娑ㄦ湡鏉冿紝鍗栧嚭楂樿鏉冧环鐪嬫定鏈熸潈銆傞檷浣庢垚鏈紝闄愬埗椋庨櫓鍜屾敹鐩娿€傞€傚悎娓╁拰鐪嬫定銆?,
    "bear-put": "鐔婂競鐪嬭穼浠峰樊锛氫拱鍏ラ珮琛屾潈浠风湅璺屾湡鏉冿紝鍗栧嚭浣庤鏉冧环鐪嬭穼鏈熸潈銆傞檷浣庢垚鏈紝闄愬埗椋庨櫓鍜屾敹鐩娿€傞€傚悎娓╁拰鐪嬭穼銆?,
    "iron-condor": "閾侀拱浠峰樊锛氬崠鍑鸿法寮忕粍鍚堝悓鏃朵拱鍏ュ璺ㄥ紡缁勫悎銆傚湪鏍囩殑浠锋牸娉㈠姩杈冨皬鏃惰幏鍒╋紝椋庨櫓鏀剁泭鍧囨湁闄愩€?,
    "straddle": "涔板叆璺ㄥ紡锛氬悓鏃朵拱鍏ョ浉鍚岃鏉冧环鐨勭湅娑ㄥ拰鐪嬭穼鏈熸潈銆傞鏈熸爣鐨勫ぇ骞呮尝鍔ㄤ絾鏂瑰悜涓嶆槑鏃朵娇鐢ㄣ€?
};

function initStrategyAnalysis() {
    const strategyBtns = document.querySelectorAll(".strategy-btn");
    if (strategyBtns.length === 0) return;
    
    strategyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            strategyBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const strategy = btn.dataset.strategy;
            drawPayoffChart(strategy);
            document.getElementById("strategyDesc").textContent = STRATEGY_DESCRIPTIONS[strategy] || "";
        });
    });
    
    strategyBtns[0].click();
}

function drawPayoffChart(strategy) {
    const canvas = document.getElementById("payoffChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    const minPrice = 80, maxPrice = 120;
    const data = [];
    for (let S = minPrice; S <= maxPrice; S += 0.5) {
        let payoff = 0;
        switch(strategy) {
            case "long-call": payoff = Math.max(0, S - 100) - 5; break;
            case "long-put": payoff = Math.max(0, 100 - S) - 5; break;
            case "covered-call": payoff = S - 100 + Math.min(0, 100 - S) + 3; break;
            case "protective-put": payoff = S - 100 + Math.max(0, 100 - S) - 3; break;
            case "bull-call": payoff = Math.max(0, S - 95) - Math.max(0, S - 105) - 3; break;
            case "bear-put": payoff = Math.max(0, 105 - S) - Math.max(0, 95 - S) - 3; break;
            case "iron-condor": payoff = Math.max(0, 95 - S) - Math.max(0, 90 - S) - Math.max(0, S - 110) + Math.max(0, S - 115) - 2; break;
            case "straddle": payoff = Math.max(0, S - 100) + Math.max(0, 100 - S) - 8; break;
        }
        data.push({ S, payoff });
    }
    
    const maxPayoff = Math.max(...data.map(d => d.payoff), 10);
    const minPayoff = Math.min(...data.map(d => d.payoff), -10);
    const range = maxPayoff - minPayoff;
    
    // 鍧愭爣杞?    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, h - 30);
    ctx.lineTo(w - 10, h - 30);
    ctx.stroke();
    
    // 闆剁嚎
    const zeroY = h - 30 - ((-minPayoff) / range) * (h - 40);
    ctx.strokeStyle = "#64748b";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(40, zeroY);
    ctx.lineTo(w - 10, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // 鐩堜簭鏇茬嚎
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((d, i) => {
        const x = 40 + ((d.S - minPrice) / (maxPrice - minPrice)) * (w - 50);
        const y = h - 30 - ((d.payoff - minPayoff) / range) * (h - 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // 鏍囩
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText(minPrice, 40, h - 10);
    ctx.fillText(maxPrice, w - 40, h - 10);
    ctx.fillText("鍒版湡鑲′环", w / 2, h - 10);
    ctx.save();
    ctx.translate(15, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("鐩堜簭", 0, 0);
    ctx.restore();
}

// ==================== 鎸佷粨绠＄悊 ====================
function initPortfolio() {
    const positions = [
        { code: "510050C2503M02500", name: "50ETF璐?鏈?.50", side: "涔板叆", qty: 10, cost: 0.1852, price: 0.1921, pnl: 690 },
        { code: "510050P2503M02600", name: "50ETF娌?鏈?.60", side: "涔板叆", qty: 5, cost: 0.0521, price: 0.0485, pnl: -180 }
    ];
    
    const tbody = document.getElementById("positionsBody");
    if (!tbody) return;
    
    let totalValue = 0, dailyPnL = 0, totalPnL = 0;
    let html = "";
    
    positions.forEach(pos => {
        const value = pos.qty * pos.price * 10000;
        const pnl = pos.qty * (pos.price - pos.cost) * 10000;
        totalValue += value;
        totalPnL += pnl;
        
        html += `<tr>
            <td>${pos.code}</td>
            <td>${pos.name}</td>
            <td>${pos.side}</td>
            <td>${pos.qty}</td>
            <td>${pos.cost.toFixed(4)}</td>
            <td>${pos.price.toFixed(4)}</td>
            <td class="${pnl >= 0 ? "positive" : "negative"}">${pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}</td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
    
    document.getElementById("totalValue").textContent = "楼" + totalValue.toFixed(0);
    document.getElementById("dailyPnL").textContent = (totalPnL >= 0 ? "+" : "") + "楼" + totalPnL.toFixed(0);
    document.getElementById("dailyPnL").className = "value " + (totalPnL >= 0 ? "positive" : "negative");
    document.getElementById("totalPnL").textContent = (totalPnL >= 0 ? "+" : "") + "楼" + totalPnL.toFixed(0);
    document.getElementById("totalPnL").className = "value " + (totalPnL >= 0 ? "positive" : "negative");
    
    // Greeks姹囨€?    document.getElementById("portfolioDelta").textContent = "0.45";
    document.getElementById("portfolioGamma").textContent = "0.02";
    document.getElementById("portfolioTheta").textContent = "-125";
    document.getElementById("portfolioVega").textContent = "850";
}

// ==================== 鎼滅储鍔熻兘 ====================
function initSearch() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("stockSearch");
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const code = searchInput.value.trim();
            if (code) {
                alert(`姝ｅ湪鏌ヨ: ${code}\n瀹為檯浣跨敤鏃跺皢杩炴帴鐪熷疄API鑾峰彇鏁版嵁`);
            }
        });
        
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") searchBtn.click();
        });
    }
}

// ==================== 鏃堕棿鏇存柊 ====================
function updateTime() {
    const el = document.getElementById("currentTime");
    if (el) el.textContent = new Date().toLocaleTimeString("zh-CN");
}

// ==================== 鍒濆鍖?====================
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initCalculator();
    initStrategyAnalysis();
    initPortfolio();
    initSearch();
    
    // 鍚姩瀹炴椂鏁版嵁
    marketData.connect();
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // 妯℃嫙VIX
    document.getElementById("vixValue").textContent = "18.52";
});
