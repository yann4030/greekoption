<template>
  <div class="dashboard">
    <!-- 实时推荐 -->
    <el-row :gutter="20" class="recommendation-row">
      <el-col :span="24">
        <el-card class="recommendation-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🎯 实时交易推荐</span>
              <el-tag type="success" v-if="marketStore.lastUpdate">
                更新于 {{ formatTime(marketStore.lastUpdate) }}
              </el-tag>
            </div>
          </template>
          
          <div v-if="marketStore.loading" class="loading">
            <el-skeleton :rows="3" animated />
          </div>
          
          <div v-else-if="marketStore.bestRecommendation" class="best-rec">
            <el-row :gutter="20">
              <el-col :xs="24" :sm="12" :md="8">
                <div class="rec-item">
                  <div class="rec-label">最佳标的</div>
                  <div class="rec-value">
                    {{ marketStore.bestRecommendation.name }}
                    <span class="rec-symbol">({{ marketStore.bestRecommendation.symbol }})</span>
                  </div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8">
                <div class="rec-item">
                  <div class="rec-label">当前价格</div>
                  <div class="rec-value" :class="getChangeClass(marketStore.bestRecommendation.change_pct)">
                    {{ marketStore.bestRecommendation.price.toFixed(3) }}
                    <span class="change">
                      {{ marketStore.bestRecommendation.change_pct >= 0 ? '+' : '' }}
                      {{ marketStore.bestRecommendation.change_pct }}%
                    </span>
                  </div>
                </div>
              </el-col>
              
              <el-col :xs="24" :sm="12" :md="8">
                <div class="rec-item">
                  <div class="rec-label">隐含波动率</div>
                  <div class="rec-value">
                    {{ marketStore.bestRecommendation.iv }}%
                    <el-tag size="small" :type="getIVTagType(marketStore.bestRecommendation.iv)">
                      {{ getIVLevel(marketStore.bestRecommendation.iv) }}
                    </el-tag>
                  </div>
                </div>
              </el-col>
            </el-row>
            
            <div class="rec-action">
              <el-button type="primary" @click="goToCalculator">
                <el-icon><Calculator /></el-icon>
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- ETF列表 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>📈 ETF行情</span>
              <el-button :loading="marketStore.loading" @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <el-table :data="marketStore.sortedETFs" style="width: 100%">
            <el-table-column prop="symbol" label="代码" width="100" />
            <el-table-column prop="name" label="名称" width="120" />
            
            <el-table-column label="现价" width="120">
              <template #default="{ row }">
                <span :class="getChangeClass(row.change_pct)">
                  {{ row.price.toFixed(3) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column label="涨跌" width="120">
              <template #default="{ row }">
                <span :class="getChangeClass(row.change_pct)">
                  {{ row.change_pct >= 0 ? '+' : '' }}{{ row.change_pct }}%
                </span>
              </template>
            </el-table-column>
            
            <el-table-column label="IV" width="120">
              <template #default="{ row }">
                {{ row.iv }}%
              </template>
            </el-table-column>
            
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="selectETF(row)">
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { useMarketStore } from "@/stores"
import type { ETFQuote } from "@/types"

const router = useRouter()
const marketStore = useMarketStore()
let refreshTimer: number

onMounted(() => {
  refreshTimer = marketStore.startAutoRefresh(5000)
})

onUnmounted(() => {
  clearInterval(refreshTimer)
})

const refreshData = () => {
  marketStore.fetchETFList()
}

const selectETF = (etf: ETFQuote) => {
  marketStore.selectETF(etf.symbol)
  router.push("/calculator")
}

const goToCalculator = () => {
  router.push("/calculator")
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("zh-CN")
}

const getChangeClass = (change: number) => {
  return change >= 0 ? "positive" : "negative"
}

const getIVLevel = (iv: number) => {
  if (iv < 18) return "偏低"
  if (iv < 25) return "中等"
  if (iv < 35) return "偏高"
  return "极高"
}

const getIVTagType = (iv: number) => {
  if (iv < 18) return "info"
  if (iv < 25) return "success"
  if (iv < 35) return "warning"
  return "danger"
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.recommendation-row {
  margin-bottom: 20px;
}

.recommendation-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #334155;
}

.recommendation-card :deep(.el-card__header) {
  border-bottom: 1px solid #334155;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.best-rec {
  padding: 10px 0;
}

.rec-item {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 10px;
}

.rec-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.rec-value {
  font-size: 24px;
  font-weight: 600;
  color: #e2e8f0;
}

.rec-symbol {
  font-size: 14px;
  color: #64748b;
  margin-left: 8px;
}

.change {
  font-size: 14px;
  margin-left: 8px;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

.rec-action {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #334155;
}

.loading {
  padding: 20px;
}
</style>
