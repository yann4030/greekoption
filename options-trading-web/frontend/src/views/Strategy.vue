<template>
  <div class="strategy">
    <h1>Strategy Analysis</h1>
    
    <div class="strategy-grid">
      <div class="strategy-selector">
        <h2>Select Strategy</h2>
        <div class="strategy-list">
          <div 
            v-for="s in strategies" 
            :key="s.id"
            :class="['strategy-item', selectedStrategy === s.id ? 'active' : '']"
            @click="selectedStrategy = s.id"
          >
            <h3>{{ s.name }}</h3>
            <p>{{ s.description }}</p>
          </div>
        </div>
      </div>
      
      <div class="strategy-detail">
        <h2>{{ currentStrategy.name }}</h2>
        <div class="detail-card">
          <h3>Structure</h3>
          <ul>
            <li v-for="(leg, index) in currentStrategy.legs" :key="index">
              {{ leg }}
            </li>
          </ul>
        </div>
        
        <div class="detail-card">
          <h3>Risk Profile</h3>
          <div class="risk-grid">
            <div class="risk-item">
              <span class="label">Max Profit</span>
              <span class="value positive">{{ currentStrategy.maxProfit }}</span>
            </div>
            <div class="risk-item">
              <span class="label">Max Loss</span>
              <span class="value negative">{{ currentStrategy.maxLoss }}</span>
            </div>
            <div class="risk-item">
              <span class="label">Breakeven</span>
              <span class="value">{{ currentStrategy.breakeven }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Strategy {
  id: string
  name: string
  description: string
  legs: string[]
  maxProfit: string
  maxLoss: string
  breakeven: string
}

const strategies = ref<Strategy[]>([
  {
    id: 'iron-condor',
    name: 'Iron Condor',
    description: 'Sell OTM Call Spread + Sell OTM Put Spread',
    legs: ['Sell Call @ K2', 'Buy Call @ K3', 'Sell Put @ K1', 'Buy Put @ K0'],
    maxProfit: 'Limited (Net Credit)',
    maxLoss: 'Limited (Spread Width - Credit)',
    breakeven: 'Upper: Short Call + Credit, Lower: Short Put - Credit'
  },
  {
    id: 'bull-call',
    name: 'Bull Call Spread',
    description: 'Buy ATM Call + Sell OTM Call',
    legs: ['Buy Call @ K1', 'Sell Call @ K2 (K2 > K1)'],
    maxProfit: 'Limited (K2 - K1 - Debit)',
    maxLoss: 'Limited (Net Debit)',
    breakeven: 'K1 + Net Debit'
  },
  {
    id: 'bear-put',
    name: 'Bear Put Spread',
    description: 'Buy ATM Put + Sell OTM Put',
    legs: ['Buy Put @ K2', 'Sell Put @ K1 (K2 > K1)'],
    maxProfit: 'Limited (K2 - K1 - Debit)',
    maxLoss: 'Limited (Net Debit)',
    breakeven: 'K2 - Net Debit'
  },
  {
    id: 'straddle',
    name: 'Long Straddle',
    description: 'Buy ATM Call + Buy ATM Put',
    legs: ['Buy Call @ K', 'Buy Put @ K'],
    maxProfit: 'Unlimited',
    maxLoss: 'Limited (Total Premium)',
    breakeven: 'K ± Total Premium'
  }
])

const selectedStrategy = ref('iron-condor')

const currentStrategy = computed(() => {
  return strategies.value.find(s => s.id === selectedStrategy.value) || strategies.value[0]
})
</script>

<style scoped>
.strategy {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #e2e8f0;
}

.strategy-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .strategy-grid {
    grid-template-columns: 1fr;
  }
}

.strategy-selector h2,
.strategy-detail h2 {
  margin-bottom: 16px;
  color: #e2e8f0;
}

.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.strategy-item {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.strategy-item:hover {
  background: #334155;
}

.strategy-item.active {
  border-color: #3b82f6;
  background: #1e3a5f;
}

.strategy-item h3 {
  margin: 0 0 8px 0;
  color: #e2e8f0;
  font-size: 16px;
}

.strategy-item p {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
}

.strategy-detail {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
}

.detail-card {
  background: #0f172a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.detail-card h3 {
  margin-bottom: 12px;
  color: #94a3b8;
  font-size: 14px;
}

.detail-card ul {
  margin: 0;
  padding-left: 20px;
  color: #e2e8f0;
}

.detail-card li {
  margin-bottom: 8px;
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.risk-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.risk-item .label {
  color: #94a3b8;
  font-size: 12px;
}

.risk-item .value {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.risk-item .value.positive {
  color: #10b981;
}

.risk-item .value.negative {
  color: #ef4444;
}
</style>
