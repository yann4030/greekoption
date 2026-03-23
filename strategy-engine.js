/**
 * 策略引擎 - 基于50ETF高波动降波策略文档
 * 自动生成可执行的交易方案
 */

class StrategyEngine {
    constructor() {
        this.strategies = {
            ironCondor: {
                name: "铁鹰策略",
                nameEn: "Iron Condor",
                description: "同时卖出看涨和看跌期权，买入更远保护腿，风险封顶，适合高波环境做空波动率",
                riskLevel: "中",
                complexity: "中",
                maxLoss: "有限",
                maxProfit: "有限",
                idealIV: "高IV",
                direction: "中性"
            },
            collar: {
                name: "领口策略",
                nameEn: "Collar",
                description: "持有现货+卖出虚值Call+买入虚值Put，降低组合波动，适合有现货持仓",
                riskLevel: "低",
                complexity: "中",
                maxLoss: "有限",
                maxProfit: "有限",
                idealIV: "高IV",
                direction: "中性偏多"
            },
            coveredCall: {
                name: "备兑策略",
                nameEn: "Covered Call",
                description: "持有现货+卖出虚值Call，收取权利金降低成本，适合偏中性偏多",
                riskLevel: "低",
                complexity: "低",
                maxLoss: "较大",
                maxProfit: "有限",
                idealIV: "高IV",
                direction: "中性偏多"
            },
            bullPutSpread: {
                name: "牛市看跌价差",
                nameEn: "Bull Put Spread",
                description: "卖出虚值Put+买入更虚值Put，适合认为不会继续大跌",
                riskLevel: "中",
                complexity: "低",
                maxLoss: "有限",
                maxProfit: "有限",
                idealIV: "高IV",
                direction: "轻度偏多"
            }
        };
        
        this.underlyings = {
            "510050": { name: "50ETF", type: "大盘", liquidity: "极高", volatility: "中" },
            "510300": { name: "300ETF", type: "宽基", liquidity: "极高", volatility: "中" },
            "510500": { name: "500ETF", type: "中小盘", liquidity: "高", volatility: "高" },
            "159915": { name: "创业板ETF", type: "成长", liquidity: "高", volatility: "极高" },
            "588000": { name: "科创50ETF", type: "科技", liquidity: "中", volatility: "极高" }
        };
    }

    /**
     * 生成交易方案
     */
    generateTradingPlan(preferences) {
        const {
            hasSpotPosition,      // 是否持有现货
            marketView,           // 市场观点: bearish/neutral/bullish
            riskTolerance,        // 风险承受: conservative/moderate/aggressive
            capital,              // 资金规模
            experience            // 经验水平: beginner/intermediate/advanced
        } = preferences;

        let recommendations = [];

        // 根据持仓情况选择策略类型
        if (hasSpotPosition) {
            // 有现货 - 优先考虑降波+保护
            recommendations.push(this.buildCollarPlan());
            recommendations.push(this.buildCoveredCallPlan());
        } else {
            // 无现货 - 做空波动率
            recommendations.push(this.buildIronCondorPlan());
            
            if (marketView === "bullish" || marketView === "neutral") {
                recommendations.push(this.buildBullPutSpreadPlan());
            }
        }

        // 根据风险偏好调整
        recommendations = this.adjustByRisk(recommendations, riskTolerance);
        
        // 根据经验水平调整
        recommendations = this.adjustByExperience(recommendations, experience);

        return {
            timestamp: new Date().toLocaleString("zh-CN"),
            preferences: preferences,
            recommendations: recommendations,
            riskWarnings: this.generateRiskWarnings(preferences),
            executionChecklist: this.generateChecklist()
        };
    }

    /**
     * 构建铁鹰策略方案
     */
    buildIronCondorPlan() {
        return {
            strategy: this.strategies.ironCondor,
            priority: 1,
            underlyings: [
                {
                    code: "510300",
                    name: "300ETF",
                    allocation: "50%",
                    reason: "宽基均衡，流动性好，最适合标准铁鹰"
                },
                {
                    code: "510050", 
                    name: "50ETF",
                    allocation: "30%",
                    reason: "流动性最强，适合辅助仓位"
                },
                {
                    code: "510500",
                    name: "500ETF", 
                    allocation: "20%",
                    reason: "权利金更厚，但波动更大，轻仓参与"
                }
            ],
            selectionRules: {
                expiry: "20-45天",
                putDelta: "10-15",
                callDelta: "15-20",
                wingWidth: "0.10",
                putMoreConservative: true
            },
            example: {
                underlying: "300ETF",
                spotPrice: 4.41,
                legs: [
                    { side: "buy", type: "put", strike: 4.20 },
                    { side: "sell", type: "put", strike: 4.30 },
                    { side: "sell", type: "call", strike: 4.60 },
                    { side: "buy", type: "call", strike: 4.70 }
                ],
                netCredit: 0.0458,
                maxProfit: 458,
                maxLoss: 542,
                breakEven: { lower: 4.254, upper: 4.646 }
            },
            management: {
                takeProfit: "40-60%最大利润",
                stopLoss: "亏损达到权利金1-1.5倍",
                timeExit: "剩余7天考虑平仓"
            }
        };
    }

    /**
     * 构建领口策略方案
     */
    buildCollarPlan() {
        return {
            strategy: this.strategies.collar,
            priority: 1,
            underlyings: [
                {
                    code: "510050",
                    name: "50ETF",
                    allocation: "100%",
                    reason: "流动性最好，适合领口策略"
                }
            ],
            selectionRules: {
                expiry: "20-45天",
                callDelta: "20-30",
                putDelta: "10-20",
                target: "低成本或零成本"
            },
            example: {
                underlying: "50ETF",
                spotPrice: 2.86,
                hasSpot: true,
                legs: [
                    { side: "sell", type: "call", strike: 3.00, delta: 0.25 },
                    { side: "buy", type: "put", strike: 2.75, delta: 0.15 }
                ],
                targetCost: "零成本或接近零成本"
            },
            management: {
                adjustment: "价格大幅移动时考虑滚动",
                rollTrigger: "标的价格接近卖出行权价"
            }
        };
    }

    /**
     * 构建备兑策略方案
     */
    buildCoveredCallPlan() {
        return {
            strategy: this.strategies.coveredCall,
            priority: 2,
            underlyings: [
                {
                    code: "510050",
                    name: "50ETF",
                    allocation: "100%",
                    reason: "标准备兑标的"
                }
            ],
            selectionRules: {
                expiry: "20-45天",
                callDelta: "15-35",
                aggressiveness: "根据降波需求调整"
            },
            example: {
                underlying: "50ETF",
                spotPrice: 2.86,
                hasSpot: true,
                legs: [
                    { side: "sell", type: "call", strike: 3.00, delta: 0.20 }
                ]
            },
            management: {
                takeProfit: "权利金收到50-60%",
                rollUp: "标的大幅上涨时考虑向上滚动"
            }
        };
    }

    /**
     * 构建牛市看跌价差方案
     */
    buildBullPutSpreadPlan() {
        return {
            strategy: this.strategies.bullPutSpread,
            priority: 2,
            underlyings: [
                {
                    code: "510300",
                    name: "300ETF",
                    allocation: "60%",
                    reason: "稳健"
                },
                {
                    code: "510050",
                    name: "50ETF",
                    allocation: "40%",
                    reason: "流动性"
                }
            ],
            selectionRules: {
                expiry: "20-45天",
                putDelta: "15-25",
                spreadWidth: "0.10"
            },
            example: {
                underlying: "300ETF",
                spotPrice: 4.41,
                legs: [
                    { side: "sell", type: "put", strike: 4.30 },
                    { side: "buy", type: "put", strike: 4.20 }
                ]
            }
        };
    }

    /**
     * 根据风险偏好调整
     */
    adjustByRisk(plans, riskTolerance) {
        return plans.map(plan => {
            const adjusted = { ...plan };
            
            if (riskTolerance === "conservative") {
                // 保守型 - 卖腿更远
                if (adjusted.selectionRules) {
                    adjusted.selectionRules.putDelta = "8-12";
                    adjusted.selectionRules.callDelta = "10-15";
                }
                adjusted.positionSize = "轻仓";
                adjusted.notes = "保守型配置：卖腿Delta更小，留出更大缓冲空间";
            } else if (riskTolerance === "aggressive") {
                // 激进型 - 可以稍近
                if (adjusted.selectionRules) {
                    adjusted.selectionRules.putDelta = "15-20";
                    adjusted.selectionRules.callDelta = "20-25";
                }
                adjusted.positionSize = "适中仓位";
                adjusted.notes = "激进型配置：卖腿Delta稍大，收取更多权利金但风险增加";
            } else {
                adjusted.positionSize = "标准仓位";
            }
            
            return adjusted;
        });
    }

    /**
     * 根据经验水平调整
     */
    adjustByExperience(plans, experience) {
        return plans.map(plan => {
            const adjusted = { ...plan };
            
            if (experience === "beginner") {
                // 新手 - 简化结构，强调风险控制
                adjusted.complexity = "简化";
                adjusted.recommended = plan.strategy.name === "铁鹰策略" || 
                                      plan.strategy.name === "备兑策略";
                adjusted.warnings = [
                    "建议先模拟交易熟悉策略",
                    "严格控制单笔仓位",
                    "严格执行止损规则"
                ];
            } else if (experience === "advanced") {
                // 高级 - 可以加入动态调整
                adjusted.dynamicAdjustment = true;
                adjusted.advancedTechniques = [
                    "根据 Greeks 动态调整",
                    "波动率曲面交易",
                    "多期限组合"
                ];
            }
            
            return adjusted;
        });
    }

    /**
     * 生成风险提示
     */
    generateRiskWarnings(preferences) {
        const warnings = [];
        
        if (!preferences.hasSpotPosition) {
            warnings.push("无现货持仓做空波动率，务必使用有限风险结构（铁鹰），禁止裸卖");
        }
        
        if (preferences.riskTolerance === "aggressive") {
            warnings.push("激进配置卖腿较近，更容易被突破，需更严格止损");
        }
        
        if (preferences.experience === "beginner") {
            warnings.push("新手建议先用模拟盘熟悉策略，实盘严格控制仓位");
        }
        
        warnings.push("高波动环境下，IV可能继续冲高，务必设置止损");
        warnings.push("临近到期Gamma风险急剧上升，不建议持有到最后");
        
        return warnings;
    }

    /**
     * 生成执行检查清单
     */
    generateChecklist() {
        return {
            beforeEntry: [
                "确认到期日 >= 20天",
                "确认卖腿Delta在建议范围内",
                "确认两边都有保护腿（铁鹰）",
                "计算最大亏损可接受",
                "确认流动性足够（买卖价差小）",
                "确认无重大事件即将公布"
            ],
            duringHolding: [
                "每日检查标的价格位置",
                "监控隐含波动率变化",
                "评估组合盈亏变化",
                "检查是否触发止盈/止损",
                "记录交易日志"
            ],
            exitRules: [
                "盈利达到40-60%最大利润考虑平仓",
                "亏损达到权利金1-1.5倍考虑止损",
                "标的价格突破卖腿行权价考虑处理",
                "剩余7天开始主动考虑平仓",
                "剩余5天原则上不恋战"
            ]
        };
    }

    /**
     * 计算 Greeks
     */
    calculateGreeks(S, K, T, r, sigma, type) {
        // 简化版 Greeks 计算
        const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
        const d2 = d1 - sigma * Math.sqrt(T);
        
        const Nd1 = this.normalCDF(d1);
        const Nd2 = this.normalCDF(d2);
        const Npd1 = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
        
        let delta, gamma, theta, vega, rho;
        
        if (type === "call") {
            delta = Nd1;
            rho = K * T * Math.exp(-r * T) * Nd2 / 100;
        } else {
            delta = Nd1 - 1;
            rho = -K * T * Math.exp(-r * T) * (1 - Nd2) / 100;
        }
        
        gamma = Npd1 / (S * sigma * Math.sqrt(T));
        vega = S * Npd1 * Math.sqrt(T) / 100;
        theta = -(S * Npd1 * sigma) / (2 * Math.sqrt(T));
        
        if (type === "call") {
            theta -= r * K * Math.exp(-r * T) * Nd2;
        } else {
            theta += r * K * Math.exp(-r * T) * (1 - Nd2);
        }
        theta = theta / 365;
        
        return { delta, gamma, theta, vega, rho };
    }

    normalCDF(x) {
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
        const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);
        const t = 1 / (1 + p * x);
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return 0.5 * (1 + sign * y);
    }
}

// 全局实例
const strategyEngine = new StrategyEngine();
