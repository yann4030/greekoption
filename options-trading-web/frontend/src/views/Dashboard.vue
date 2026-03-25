<template>
  <div class="dashboard">
    <h1>Market Dashboard</h1>
    
    <div class="etf-grid">
      <div v-for="etf in etfList" :key="etf.symbol" class="etf-card" @click="selectETF(etf)">
        <div class="etf-header">
          <h3>{{ etf.name }}</h3>
          <span class="symbol">{{ etf.symbol }}</span>
        </div>
        <div class="etf-price">
          <span class="price">{{ etf.price.toFixed(3) }}</span>
          <span :class="['change', etf.change >= 0 ? 'up' : 'down']">
            {{ etf.change >= 0 ? '+' : '' }}{{ etf.change.toFixed(2) }}%
          </span>
        </div>
        <div class="etf-info">
          <span>IV: {{ (etf.iv * 100).toFixed(1) }}%</span>
          <span>Vol: {{ formatVolume(etf.volume) }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="selectedETF" class="detail-section">
      <h2>{{ selectedETF.name }} Option Chain</h2>
      <div class="option-chain">
        <table>
          <thead>
            <tr>
              <th>Strike</th>
              <th>Call Price</th>
              <th>Call IV</th>
              <th>Put Price</th>
              <th>Put IV</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="opt in optionChain" :key="opt.strike">
              <td>{{ opt.strike.toFixed(2) }}</td>
              <td :class="opt.callPrice > 0 ? 'positive' : ''">{{ opt.callPrice.toFixed(4) }}</td>
              <td>{{ (opt.callIV * 100).toFixed(1) }}%</td>
              <td :class="opt.putPrice > 0 ? 'negative' : ''">{{ opt.putPrice.toFixed(4) }}</td>
              <td>{{ (opt.putIV * 100).toFixed(1) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface ETF {
  symbol: string
  name: string
  price: number
  change: number
  iv: number
  volume: number
}

interface Option {
  strike: number
  callPrice: number
  callIV: number
  putPrice: number
  putIV: number
}

const etfList = ref<ETF[]>([
  { symbol: '510050', name: '50ETF', price: 2.870, change: 0.07, iv: 0.225, volume: 13990000 },
  { symbol: '510300', name: '300ETF', price: 4.445, change: 0.34, iv: 0.218, volume: 8560000 },
  { symbol: '510500', name: '500ETF', price: 7.548, change: 0.48, iv: 0.252, volume: 4230000 },
])

const selectedETF = ref<ETF | null>(null)
const optionChain = ref<Option[]>([])

const selectETF = (etf: ETF) => {
  selectedETF.value = etf
  generateOptionChain(etf.price)
}

const generateOptionChain = (spotPrice: number) => {
  const strikes: number[] = []
  const baseStrike = Math.round(spotPrice * 20) / 20
  for (let i = -4; i <= 4; i++) {
    strikes.push(baseStrike + i * 0.1)
  }
  
  optionChain.value = strikes.map(strike => {
    const distance = Math.abs(strike - spotPrice)
    const callPrice = Math.max(0, spotPrice - strike + 0.05) * Math.exp(-distance * 2)
    const putPrice = Math.max(0, strike - spotPrice + 0.05) * Math.exp(-distance * 2)
    
    return {
      strike,
      callPrice,
      callIV: 0.20 + distance * 0.1,
      putPrice,
      putIV: 0.22 + distance * 0.1,
    }
  })
}

const formatVolume = (vol: number) => {
  if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M'
  if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K'
  return vol.toString()
}

onMounted(() => {
  selectETF(etfList.value[1])
})
</script>

<style scoped>
.dashboard { padding: 20px; }
h1 { margin-bottom: 20px; color: #e2e8f0; }
.etf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 30px; }
.etf-card { background: #1e293b; border-radius: 12px; padding: 20px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.etf-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2); }
.etf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.etf-header h3 { margin: 0; color: #e2e8f0; }
.symbol { color: #64748b; font-size: 14px; }
.etf-price { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
.price { font-size: 32px; font-weight: bold; color: #e2e8f0; }
.change { font-size: 18px; font-weight: 600; }
.change.up { color: #10b981; }
.change.down { color: #ef4444; }
.etf-info { display: flex; gap: 16px; color: #94a3b8; font-size: 14px; }
.detail-section { background: #1e293b; border-radius: 12px; padding: 20px; }
.detail-section h2 { margin-bottom: 16px; color: #e2e8f0; }
.option-chain { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; text-align: center; border-bottom: 1px solid #334155; }
th { color: #94a3b8; font-weight: 600; }
td { color: #e2e8f0; }
td.positive { color: #10b981; }
td.negative { color: #ef4444; }
</style>
