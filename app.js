// 期权交易GUI - 主应用脚本

// 标准正态分布CDF
function normalCDF(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1 + sign * y);
}

// 标准正态分布PDF
function normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Black-Scholes定价
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

// 页面导航
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

// 期权计算器
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

// 策略盈亏图
function initStrategyAnalysis() {
    const strategyBtns = document.querySelectorAll(".strategy-btn");
    if (strategyBtns.length === 0) return;
    strategyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            strategyBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            drawPayoffChart(btn.dataset.strategy);
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
    
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, h - 30);
    ctx.lineTo(w - 10, h - 30);
    ctx.stroke();
    
    const zeroY = h - 30 - ((-minPayoff) / range) * (h - 40);
    ctx.strokeStyle = "#64748b";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(40, zeroY);
    ctx.lineTo(w - 10, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
    
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
}

// 持仓管理
function initPortfolio() {
    const positions = [
        { code: "510050C2503M02500", name: "50ETF购3月2.50", side: "买入", qty: 10, cost: 0.1852, price: 0.1921, pnl: 690 },
        { code: "510050P2503M02600", name: "50ETF沽3月2.60", side: "买入", qty: 5, cost: 0.0521, price: 0.0485, pnl: -180 }
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
    
    document.getElementById("totalValue").textContent = "¥" + totalValue.toFixed(0);
    document.getElementById("dailyPnL").textContent = (totalPnL >= 0 ? "+" : "") + "¥" + totalPnL.toFixed(0);
    document.getElementById("dailyPnL").className = "value " + (totalPnL >= 0 ? "positive" : "negative");
    document.getElementById("totalPnL").textContent = (totalPnL >= 0 ? "+" : "") + "¥" + totalPnL.toFixed(0);
    document.getElementById("totalPnL").className = "value " + (totalPnL >= 0 ? "positive" : "negative");
    
    document.getElementById("portfolioDelta").textContent = "0.45";
    document.getElementById("portfolioGamma").textContent = "0.02";
    document.getElementById("portfolioTheta").textContent = "-125";
    document.getElementById("portfolioVega").textContent = "850";
}

// 搜索功能
function initSearch() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("stockSearch");
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const code = searchInput.value.trim();
            if (code) {
                alert("正在查询: " + code + "\n实际使用时将连接真实API获取数据");
            }
        });
        
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") searchBtn.click();
        });
    }
}

// 更新时间
function updateTime() {
    const el = document.getElementById("currentTime");
    if (el) el.textContent = new Date().toLocaleTimeString("zh-CN");
}

// 选择行权价
function selectStrike(strike) {
    const strikeInput = document.getElementById("strikePrice");
    if (strikeInput) {
        strikeInput.value = (strike * 100).toFixed(2);
        document.querySelector("[data-page=\"calculator\"]").click();
        document.getElementById("calcBtn").click();
    }
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initCalculator();
    initStrategyAnalysis();
    initPortfolio();
    initSearch();
    
    if (typeof marketData !== "undefined") {
        marketData.connect();
    }
    
    updateTime();
    setInterval(updateTime, 1000);
});