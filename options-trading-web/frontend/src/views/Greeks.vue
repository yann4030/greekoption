<template>
  <div class="greeks">
    <!-- Greeks仪表盘 -->
    <el-row :gutter="20" class="greeks-dashboard">
      <el-col :xs="24" :sm="12" :md="8" :lg="4" v-for="greek in greeksList" :key="greek.name">
        <el-card shadow="hover" :class="["greek-card", greek.status]">
          <div class="greek-value">{{ formatGreek(greek.value) }}</div>
          <div class="greek-name">{{ greek.name }}</div>
          <div class="greek-desc">{{ greek.description }}</div>
          <el-tag :type="greek.status" size="small" class="greek-tag">
            {{ greek.statusText }}
          </el-tag>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 风险分析图表 -->
    <el-row :gutter="20" class="charts-row">
      <!-- Delta风险 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Delta 风险分布</span>
              <el-tooltip content="Delta表示标的价格变动1元时期权价格的变化">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="deltaChartRef" class="chart"></div>
        </el-card>
      </el-col>
      
      <!-- Greeks雷达图 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Greeks 风险雷达</span>
            </div>
          </template>
          <div ref="radarChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- Theta时间衰减 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>Theta 时间衰减分析</span>
              <el-tooltip content="Theta表示时间每减少一天期权价值的变化">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </template>
          <div ref="thetaChartRef" class="chart-large"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 持仓Greeks明细 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>持仓 Greeks 明细</span>
            </div>
          </template>
          
          <el-table :data="positionGreeks" style="width: 100%">
            <el-table-column prop="symbol" label="期权代码" width="150" />
            <el-table-column prop="delta" label="Delta">
              <template #default="{ row }">
                <span :class="getGreekClass(row.delta)">{{ row.delta.toFixed(4) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="gamma" label="Gamma">
              <template #default="{ row }">
                {{ row.gamma.toFixed(4) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="theta" label="Theta">
              <template #default="{ row }">
                <span :class="row.theta < 0 ? 'negative' : 'positive'">{{ row.theta.toFixed(4) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="vega" label="Vega">
              <template #default="{ row }">
                {{ row.vega.toFixed(4) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="rho" label="Rho">
              <template #default="{ row }">
                {{ row.rho.toFixed(4) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import * as echarts from "echarts"
import * as api from "@/api"

const deltaChartRef = ref<HTMLDivElement>()
const radarChartRef = ref<HTMLDivElement>()
const thetaChartRef = ref<HTMLDivElement>()

let deltaChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null
let thetaChart: echarts.ECharts | null = null

// 模拟Greeks数据
const portfolioGreeks = ref({
  delta: 0.45,
  gamma: 0.02,
  theta: -125,
  vega: 850,
  rho: 320,
})

const greeksList = computed(() => [
  {
    name: "Delta",
    value: portfolioGreeks.value.delta,
    description: "方向风险",
    status: Math.abs(portfolioGreeks.value.delta) > 0.5 ? "warning" : "success",
    statusText: Math.abs(portfolioGreeks.value.delta) > 0.5 ? "偏高" : "正常",
  },
  {
    name: "Gamma",
    value: portfolioGreeks.value.gamma,
    description: "凸性风险",
    status: portfolioGreeks.value.gamma > 0.05 ? "danger" : "success",
    statusText: portfolioGreeks.value.gamma > 0.05 ? "高" : "正常",
  },
  {
    name: "Theta",
    value: portfolioGreeks.value.theta,
    description: "时间衰减",
    status: portfolioGreeks.value.theta < -200 ? "warning" : "info",
    statusText: portfolioGreeks.value.theta < -200 ? "快速衰减" : "正常",
  },
  {
    name: "Vega",
    value: portfolioGreeks.value.vega,
    description: "波动率风险",
    status: portfolioGreeks.value.vega > 1000 ? "danger" : "success",
    statusText: portfolioGreeks.value.vega > 1000 ? "高" : "正常",
  },
  {
    name: "Rho",
    value: portfolioGreeks.value.rho,
    description: "利率风险",
    status: "info",
    statusText: "正常",
  },
])

const positionGreeks = ref([
  { symbol: "510050C2404M02500", delta: 0.65, gamma: 0.08, theta: -45, vega: 120, rho: 85 },
  { symbol: "510050P2404M02600", delta: -0.35, gamma: 0.06, theta: -38, vega: 95, rho: -42 },
  { symbol: "510300C2404M04300", delta: 0.55, gamma: 0.07, theta: -42, vega: 110, rho: 78 },
])

onMounted(() => {
  initCharts()
  window.addEventListener("resize", handleResize)
})

const initCharts = () => {
  initDeltaChart()
  initRadarChart()
  initThetaChart()
}

const initDeltaChart = () => {
  if (!deltaChartRef.value) return
  
  deltaChart = echarts.init(deltaChartRef.value)
  
  const data = positionGreeks.value.map(p => ({
    name: p.symbol,
    value: p.delta,
  }))
  
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      textStyle: { color: "#e2e8f0" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#334155" } },
    },
    yAxis: {
      type: "category",
      data: data.map(d => d.name),
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
    },
    series: [
      {
        type: "bar",
        data: data.map(d => ({
          value: d.value,
          itemStyle: {
            color: d.value >= 0 ? "#10b981" : "#ef4444",
          },
        })),
        label: {
          show: true,
          position: "right",
          formatter: "{c}",
          color: "#e2e8f0",
        },
      },
    ],
  }
  
  deltaChart.setOption(option)
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  
  radarChart = echarts.init(radarChartRef.value)
  
  const values = [
    Math.abs(portfolioGreeks.value.delta) * 100,
    portfolioGreeks.value.gamma * 1000,
    Math.abs(portfolioGreeks.value.theta) / 10,
    portfolioGreeks.value.vega / 10,
    Math.abs(portfolioGreeks.value.rho) / 10,
  ]
  
  const option = {
    backgroundColor: "transparent",
    radar: {
      indicator: [
        { name: "Delta", max: 100 },
        { name: "Gamma", max: 100 },
        { name: "Theta", max: 100 },
        { name: "Vega", max: 100 },
        { name: "Rho", max: 100 },
      ],
      axisName: {
        color: "#94a3b8",
      },
      splitArea: {
        areaStyle: {
          color: ["rgba(30, 41, 59, 0.5)", "rgba(15, 23, 42, 0.8)"],
        },
      },
      axisLine: {
        lineStyle: { color: "#334155" },
      },
      splitLine: {
        lineStyle: { color: "#334155" },
      },
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: values,
            name: "当前组合",
            areaStyle: {
              color: "rgba(96, 165, 250, 0.3)",
            },
            lineStyle: {
              color: "#60a5fa",
            },
            itemStyle: {
              color: "#60a5fa",
            },
          },
        ],
      },
    ],
  }
  
  radarChart.setOption(option)
}

const initThetaChart = () => {
  if (!thetaChartRef.value) return
  
  thetaChart = echarts.init(thetaChartRef.value)
  
  // 模拟时间衰减曲线
  const days = Array.from({ length: 30 }, (_, i) => 30 - i)
  const thetaValues = days.map(d => -portfolioGreeks.value.theta * (1 - d / 30) * Math.random())
  
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      textStyle: { color: "#e2e8f0" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: days.map(d => `${d}天`),
      name: "剩余时间",
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
    },
    yAxis: {
      type: "value",
      name: "时间价值",
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#334155" } },
    },
    series: [
      {
        type: "line",
        data: thetaValues,
        smooth: true,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.3)" },
              { offset: 1, color: "rgba(239, 68, 68, 0.05)" },
            ],
          },
        },
        lineStyle: {
          color: "#ef4444",
        },
      },
    ],
  }
  
  thetaChart.setOption(option)
}

const handleResize = () => {
  deltaChart?.resize()
  radarChart?.resize()
  thetaChart?.resize()
}

const formatGreek = (value: number) => {
  if (Math.abs(value) >= 100) {
    return value.toFixed(0)
  } else if (Math.abs(value) >= 1) {
    return value.toFixed(2)
  } else {
    return value.toFixed(4)
  }
}

const getGreekClass = (value: number) => {
  if (value > 0.5) return "positive"
  if (value < -0.5) return "negative"
  return ""
}
</script>

<style scoped>
.greeks {
  padding: 0;
}

.greeks-dashboard {
  margin-bottom: 20px;
}

.greek-card {
  text-align: center;
  padding: 10px 0;
}

.greek-card.success {
  border-top: 3px solid #10b981;
}

.greek-card.warning {
  border-top: 3px solid #f59e0b;
}

.greek-card.danger {
  border-top: 3px solid #ef4444;
}

.greek-card.info {
  border-top: 3px solid #3b82f6;
}

.greek-value {
  font-size: 32px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.greek-name {
  font-size: 16px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 4px;
}

.greek-desc {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 10px;
}

.greek-tag {
  margin-top: 5px;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.chart {
  height: 300px;
}

.chart-large {
  height: 350px;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}
</style>
