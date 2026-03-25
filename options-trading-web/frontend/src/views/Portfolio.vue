<template>
  <div class="portfolio">
    <h1>Portfolio</h1>
    
    <div class="portfolio-summary">
      <div class="summary-card">
        <div class="summary-label">Total Value</div>
        <div class="summary-value">¥{{ totalValue.toFixed(2) }}</div>
      </div>
      
      <div class="summary-card">
        <div class="summary-label">P&L</div>
        <div :class="['summary-value', totalPL >= 0 ? 'positive' : 'negative']">
          {{ totalPL >= 0 ? '+' : '' }}¥{{ totalPL.toFixed(2) }}
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-label">Positions</div>
        <div class="summary-value">{{ positions.length }}</div>
      </div>
    </div>
    
    <div class="positions-table">
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Strike</th>
            <th>Expiry</th>
            <th>Qty</th>
            <th>Entry</th>
            <th>Current</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pos in positions" :key="pos.id">
            <td>{{ pos.symbol }}</td>
            <td>{{ pos.type }}</td>
            <td>{{ pos.strike }}</td>
            <td>{{ pos.expiry }}</td>
            <td>{{ pos.quantity }}</td>
            <td>{{ pos.entryPrice.toFixed(4) }}</td>
            <td>{{ pos.currentPrice.toFixed(4) }}</td>
            <td :class="pos.pl >= 0 ? 'positive' : 'negative'">
              {{ pos.pl >= 0 ? '+' : '' }}{{ pos.pl.toFixed(2) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Position {
  id: number
  symbol: string
  type: string
  strike: number
  expiry: string
  quantity: number
  entryPrice: number
  currentPrice: number
  pl: number
}

const positions = ref<Position[]>([
  { id: 1, symbol: '300ETF', type: 'Call', strike: 4.5, expiry: '2024-04-26', quantity: 10, entryPrice: 0.1250, currentPrice: 0.1456, pl: 206.00 },
  { id: 2, symbol: '50ETF', type: 'Put', strike: 2.8, expiry: '2024-04-26', quantity: -5, entryPrice: 0.0890, currentPrice: 0.0756, pl: 67.00 },
  { id: 3, symbol: '500ETF', type: 'Call', strike: 7.6, expiry: '2024-05-31', quantity: 5, entryPrice: 0.2100, currentPrice: 0.1956, pl: -72.00 },
])

const totalValue = computed(() => {
  return positions.value.reduce((sum, pos) => sum + (pos.currentPrice * pos.quantity * 10000), 0)
})

const totalPL = computed(() => {
  return positions.value.reduce((sum, pos) => sum + pos.pl, 0)
})
</script>

<style scoped>
.portfolio {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #e2e8f0;
}

.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.summary-label {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 8px;
}

.summary-value {
  color: #e2e8f0;
  font-size: 28px;
  font-weight: bold;
}

.summary-value.positive {
  color: #10b981;
}

.summary-value.negative {
  color: #ef4444;
}

.positions-table {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #334155;
}

th {
  color: #94a3b8;
  font-weight: 600;
}

td {
  color: #e2e8f0;
}

td.positive {
  color: #10b981;
}

td.negative {
  color: #ef4444;
}
</style>
