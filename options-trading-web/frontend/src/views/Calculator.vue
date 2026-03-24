<template>
  <div class="calculator">
    <el-row :gutter="20">
      <!-- 输入区 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>🧮 参数输入</span>
              <el-button type="primary" :loading="calculatorStore.loading" @click="calculate">
                <el-icon><Calculate /></el-icon>
                计算
              </el-button>
            </div>
          </template>
          
          <el-form :model="form" label-position="top">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标的价格 (S)">
                  <el-input-number v-model="form.S" :precision="3" :step="0.001" style="width: 100%" />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="行权价 (K)">
                  <el-input-number v-model="form.K" :precision="3" :step="0.001" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="剩余时间 (T, 年)">
                  <el-input-number v-model="form.T" :precision="2" :step="0.01" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="无风险利率 (r, %)">
                  <el-input-number v-model="form.r" :precision="2" :step="0.1" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="波动率 (sigma, %)">
                  <el-input-number v-model="form.sigma" :precision="2" :step="1" :min="0" :max="200" style="width: 100%" />
                </el-form-item>
              </el-col>
              
              <el-col :span="12">
                <el-form-item label="期权类型">
                  <el-radio-group v-model="form.option_type" style="width: 100%">
                    <el-radio-button label="call">看涨 (Call)</el-radio-button>
                    <el-radio-button label="put">看跌 (Put)</el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          
          <!-- 快速选择 -->
          <div class="quick-select">
            <div class="quick-label">快速选择标的:</div>
            <el-radio-group v-model="selectedETF" @change="onETFChange" size="small">
              <el-radio-button v-for="etf in marketStore.etfList" :key="etf.symbol" :label="etf.symbol">
                {{ etf.name }}
              </el-radio-button>
            </el-radio-group>
          </div>
        </el-card>
      </el-col>
      
      <!-- 结果区 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="result-card">
          <template #header>
            <div class="card-header">
              <span>📊 计算结果</span>
            </div>
          </template>
          
          <div v-if="!calculatorStore.result" class="no-result">
            <el-empty description="请输入参数并点击计算" />
          </div>
          
          <div v-else class="results">
            <div class="main-result">
              <div class="result-label">期权价格</div>
              <div class="result-value">{{ calculatorStore.result.price.toFixed(4) }}</div>
            </div>
            
            <el-divider />
            
            <el-row :gutter="20" class="greeks-grid">
              <el-col :span="8">
                <div class="greek-item">
                  <div class="greek-label">Delta</div>
                  <div class="greek-value" :class="getDeltaClass(calculatorStore.result.delta)">
                    {{ calculatorStore.result.delta.toFixed(4) }}
                  </div>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="greek-item">
                  <div class="greek-label">Gamma</div>
                  <div class="greek-value">{{ calculatorStore.result.gamma.toFixed(4) }}</div>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="greek-item">
                  <div class="greek-label">Theta (每日)</div>
                  <div class="greek-value" :class="getThetaClass(calculatorStore.result.theta)">
                    {{ calculatorStore.result.theta.toFixed(4) }}
                  </div>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" class="greeks-grid">
              <el-col :span="12">
                <div class="greek-item">
                  <div class="greek-label">Vega</div>
                  <div class="greek-value">{{ calculatorStore.result.vega.toFixed(4) }}</div>
                </div>
              </el-col>
              
              <el-col :span="12">
                <div class="greek-item">
                  <div class="greek-label">Rho</div>
                  <div class="greek-value">{{ calculatorStore.result.rho.toFixed(4) }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue"
import { useMarketStore, useCalculatorStore } from "@/stores"
import type { OptionPriceRequest } from "@/types"

const marketStore = useMarketStore()
const calculatorStore = useCalculatorStore()

const selectedETF = ref("")

const form = reactive<OptionPriceRequest>({
  S: 287,
  K: 290,
  T: 0.25,
  r: 3,
  sigma: 22,
  option_type: "call",
})

onMounted(() => {
  if (marketStore.currentETF) {
    onETFChange(marketStore.currentETF.symbol)
  }
})

const onETFChange = (symbol: string) => {
  const etf = marketStore.etfList.find(e => e.symbol === symbol)
  if (etf) {
    form.S = etf.price * 100
    form.sigma = etf.iv || 22
  }
}

const calculate = async () => {
  const params: OptionPriceRequest = {
    ...form,
    r: form.r / 100,
    sigma: form.sigma / 100,
  }
  await calculatorStore.calculate(params)
}

const getDeltaClass = (delta: number) => {
  if (delta > 0.5) return "positive"
  if (delta < -0.5) return "negative"
  return ""
}

const getThetaClass = (theta: number) => {
  return theta < 0 ? "negative" : "positive"
}
</script>

<style scoped>
.calculator {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.quick-select {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #334155;
}

.quick-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.result-card {
  min-height: 400px;
}

.no-result {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.main-result {
  text-align: center;
  padding: 30px 0;
}

.result-label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.result-value {
  font-size: 48px;
  font-weight: 700;
  color: #60a5fa;
}

.greeks-grid {
  margin-top: 20px;
}

.greek-item {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.greek-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.greek-value {
  font-size: 20px;
  font-weight: 600;
  color: #e2e8f0;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}
</style>
