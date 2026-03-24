<template>
  <div class="strategy">
    <!-- 策略选择 -->
    <el-row :gutter="20" class="strategy-selector">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🎯 策略选择</span>
            </div>
          </template>
          
          <el-radio-group v-model="selectedStrategy" @change="onStrategyChange" size="large">
            <el-radio-button label="iron_condor">铁鹰策略</el-radio-button>
            <el-radio-button label="bull_call">牛市价差</el-radio-button>
            <el-radio-button label="bear_put">熊市价差</el-radio-button>
            <el-radio-button label="straddle">跨式策略</el-radio-button>
          </el-radio-group>
          
          <div class="strategy-params">
            <el-form :inline="true" :model="params">
              <el-form-item label="标的">
                <el-select v-model="params.underlying" style="width: 120px">
                  <el-option
                    v-for="etf in marketStore.etfList"
                    :key="etf.symbol"
                    :label="etf.name"
                    :value="etf.symbol"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="风险等级">
                <el-radio-group v-model="params.risk_level" size="small">
                  <el-radio-button label="low">保守</el-radio-button>
                  <el-radio-button label="medium">平衡</el-radio-button>
                  <el-radio-button label="high">激进</el-radio-button>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" :loading="loading" @click="generateStrategy">
                  <el-icon><Refresh /></el-icon>
                  生成策略
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 策略详情和盈亏图 -->
    <el-row :gutter="20" v-if="strategyResult">
      <!-- 策略结构 -->
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="strategy-detail">
          <template #header>
            <div class="card-header">
              <span>📋 策略结构</span>
            </div>
          </template>
          
          <div class="legs-list">
            <div
              v-for="(leg, index) in strategyResult.legs"
              :key="index"
              class="leg-item"
              :class="leg.side"
            >
              <div class="leg-header">
                <span class="leg-side" :class="leg.side">
                  {{ leg.side === "buy" ? "买入" : "卖出" }}
                </span>
                <span class="leg-type">{{ leg.option_type === "call" ? "看涨" : "看跌" }}</span>
              </div>
              <div class="leg-detail">
                行权价: <strong>{{ leg.strike }}</strong>
              </div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="strategy-metrics">
            <div class="metric-item">
              <div class="metric-label">净收权利金</div>
              <div class="metric-value positive">{{ strategyResult.net_credit }}</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">最大盈利</div>
              <div class="metric-value positive">+{{ strategyResult.max_profit }}</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">最大亏损</div>
              <div class="metric-value negative">{{ strategyResult.max_loss }}</div>
            </div>
            
            <div class="metric-item">
              <div class="metric-label">盈亏平衡点</div>
              <div class="metric-value">
                {{ strategyResult.break_even.join(" / ") }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 盈亏图 -->
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="payoff-chart-card">
          <template #header>
            <div class="card-header">
              <span>📈 盈亏图</span>
              <el-tag v-if="strategyResult" type="success">
                {{ strategyResult.name }}
              </el-tag>
            </div>
          </template>
          
          <div ref="chartRef" class="payoff-chart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 空状态 -->
    <el-row v-else
      <el-col :span="24">
        <el-empty description="选择策略并点击生成按钮查看盈亏图">
          <template #image
            <el-icon :size="60" color="#64748b"><TrendCharts /></el-icon>
          </template>
        </el-empty>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue"
import { useMarketStore } from "@/stores"
import * as api from "@/api"
import * as echarts from "echarts"

const marketStore = useMarketStore()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const selectedStrategy = ref("iron_condor")
const loading = ref(false)
const strategyResult = ref<any>(null)

const params = ref({
  underlying: "510300",
  risk_level: "medium",
})

onMounted(() => {
  if (marketStore.etfList.length > 0) {
    params.value.underlying = marketStore.etfList[0].symbol
  }
})

const onStrategyChange = () => {
  strategyResult.value = null
}

const generateStrategy = async () => {
  loading.value = true
  try {
    const etf = marketStore.etfList.find(e => e.symbol === params.value.underlying)
    if (!etf) return
    
    const result = await api.generateStrategy({
      underlying: params.value.underlying,
      underlying_price: etf.price,
      iv: etf.iv || 22,
      strategy_type: selectedStrategy.value,
      risk_level: params.value.risk_level,
    })
    
    strategyResult.value = result
    
    // 等待DOM更新后渲染图表
    await nextTick()
    renderPayoffChart(result.payoff_data)
  } catch (error) {
    console.error("生成策略失败:", error)
  } finally {
    loading.value = false
  }
}

const renderPayoffChart = (data: number[][]) => {
  if (!chartRef.value) return
  
  if (chart) {
    chart.dispose()
  }
  
  chart = echarts.init(chartRef.value)
  
  const prices = data.map(d => d[0])
  const payoffs = data.map(d => d[1])
  
  const option = {
    backgroundColor: "transparent",
    grid: {
      left: "10%",
      right: "5%",
      top: "10%",
      bottom: "15%",
    },
    xAxis: {
      type: "category",
      data: prices,
      name: "标的价格",
      nameLocation: "middle",
      nameGap: 30,
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
    },
    yAxis: {
      type: "value",
      name: "盈亏 (元)",
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#334155" } },
    },
    series: [
      {
        type: "line",
        data: payoffs,
        smooth: true,
        symbol: "none",
        lineStyle: {
          color: "#60a5fa",
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(96, 165, 250, 0.3)" },
              { offset: 1, color: "rgba(96, 165, 250, 0.05)" },
            ],
          },
        },
        markLine: {
          silent: true,
          data: [
            {
              yAxis: 0,
              lineStyle: { color: "#64748b", type: "dashed" },
            },
          ],
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      textStyle: { color: "#e2e8f0" },
      formatter: (params: any) => {
        const p = params[0]
        const value = p.value
        const color = value >= 0 ? "#10b981" : "#ef4444"
        return `
          <div>价格: <b>${p.name}</b></div>
          <div style="color: ${color}">盈亏: <b>${value > 0 ? "+" : ""}${value.toFixed(0)}</b></div>
        `
      },
    },
  }
  
  chart.setOption(option)
  
  // 响应式
  window.addEventListener("resize", () => chart?.resize())
}

// 监听窗口大小变化
watch(() => strategyResult.value, () => {
  if (strategyResult.value && chartRef.value) {
    nextTick(() => {
      renderPayoffChart(strategyResult.value.payoff_data)
    })
  }
})
</script>

<style scoped>
.strategy {
  padding: 0;
}

.strategy-selector {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.strategy-params {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #334155;
}

.strategy-detail {
  height: 100%;
}

.legs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leg-item {
  padding: 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 4px solid;
}

.leg-item.buy {
  border-left-color: #10b981;
}

.leg-item.sell {
  border-left-color: #ef4444;
}

.leg-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.leg-side {
  font-weight: 600;
}

.leg-side.buy {
  color: #10b981;
}

.leg-side.sell {
  color: #ef4444;
}

.leg-type {
  color: #94a3b8;
  font-size: 14px;
}

.leg-detail {
  color: #e2e8f0;
  font-size: 14px;
}

.strategy-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.metric-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.metric-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
}

.payoff-chart-card {
  height: 100%;
}

.payoff-chart {
  height: 400px;
  width: 100%;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}
</style>
