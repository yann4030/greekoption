<template>
  <div id="app">
    <div class="layout">
      <aside class="sidebar">
        <div class="logo">GreekOption</div>
        <nav>
          <a href="#" @click.prevent="currentPage = 'dashboard'" :class="{active: currentPage === 'dashboard'}">Dashboard</a>
          <a href="#" @click.prevent="currentPage = 'calculator'" :class="{active: currentPage === 'calculator'}">Calculator</a>
          <a href="#" @click.prevent="currentPage = 'strategy'" :class="{active: currentPage === 'strategy'}">Strategy</a>
          <a href="#" @click.prevent="currentPage = 'portfolio'" :class="{active: currentPage === 'portfolio'}">Portfolio</a>
          <a href="#" @click.prevent="currentPage = 'greeks'" :class="{active: currentPage === 'greeks'}">Greeks</a>
        </nav>
      </aside>
      <main>
        <!-- Dashboard Page -->
        <div v-if="currentPage === 'dashboard'" class="page">
          <h1>Market Dashboard</h1>
          <div class="etf-grid">
            <div v-for="etf in etfList" :key="etf.symbol" class="etf-card">
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
            </div>
          </div>
        </div>

        <!-- Calculator Page -->
        <div v-if="currentPage === 'calculator'" class="page">
          <h1>Option Calculator</h1>
          <div class="calculator-content">
            <div class="input-section">
              <div class="form-group">
                <label>Spot Price</label>
                <input v-model.number="calc.spot" type="number" step="0.001" />
              </div>
              <div class="form-group">
                <label>Strike Price</label>
                <input v-model.number="calc.strike" type="number" step="0.001" />
              </div>
              <button @click="calculate" class="calc-btn">Calculate</button>
            </div>
            <div class="result-section">
              <div class="result-card">
                <div class="result-label">Option Price</div>
                <div class="result-value">{{ calcResult.price.toFixed(4) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Strategy Page -->
        <div v-if="currentPage === 'strategy'" class="page">
          <h1>Strategy Analysis</h1>
          <div class="strategy-list">
            <div v-for="s in strategies" :key="s.id" class="strategy-item">
              <h3>{{ s.name }}</h3>
              <p>{{ s.description }}</p>
            </div>
          </div>
        </div>

        <!-- Portfolio Page -->
        <div v-if="currentPage === 'portfolio'" class="page">
          <h1>Portfolio</h1>
          <div class="portfolio-summary">
            <div class="summary-card">
              <div class="summary-label">Total Value</div>
              <div class="summary-value">¥125,000</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">P&L</div>
              <div class="summary-value positive">+¥5,200</div>
            </div>
          </div>
        </div>

        <!-- Greeks Page -->
        <div v-if="currentPage === 'greeks'" class="page">
          <h1>Greeks Analysis</h1>
          <div class="greeks-grid">
            <div class="greek-card">
              <div class="greek-name">Delta</div>
              <div class="greek-value">0.45</div>
            </div>
            <div class="greek-card">
              <div class="greek-name">Gamma</div>
              <div class="greek-value">0.08</div>
            </div>
            <div class="greek-card">
              <div class="greek-name">Theta</div>
              <div class="greek-value">-0.12</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref('dashboard')

const etfList = ref([
  { symbol: '510050', name: '50ETF', price: 2.870, change: 0.07 },
  { symbol: '510300', name: '300ETF', price: 4.445, change: 0.34 },
  { symbol: '510500', name: '500ETF', price: 7.548, change: 0.48 },
])

const calc = ref({ spot: 4.445, strike: 4.5 })
const calcResult = ref({ price: 0.1456 })

const calculate = () => {
  calcResult.value.price = Math.abs(calc.value.spot - calc.value.strike) + 0.1
}

const strategies = ref([
  { id: 'iron-condor', name: 'Iron Condor', description: 'Sell OTM Call Spread + Sell OTM Put Spread' },
  { id: 'bull-call', name: 'Bull Call Spread', description: 'Buy ATM Call + Sell OTM Call' },
  { id: 'bear-put', name: 'Bear Put Spread', description: 'Buy ATM Put + Sell OTM Put' },
  { id: 'straddle', name: 'Long Straddle', description: 'Buy ATM Call + Buy ATM Put' },
])
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 200px;
  background: #1e293b;
  padding: 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 20px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

nav a {
  color: #94a3b8;
  text-decoration: none;
  padding: 10px;
  border-radius: 6px;
  display: block;
}

nav a:hover,
nav a.active {
  background: #3b82f6;
  color: white;
}

main {
  flex: 1;
  padding: 20px;
}

.page h1 {
  margin-bottom: 20px;
  color: #e2e8f0;
}

/* Dashboard */
.etf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.etf-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
}

.etf-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.etf-header h3 {
  color: #e2e8f0;
}

.symbol {
  color: #64748b;
}

.etf-price {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price {
  font-size: 32px;
  font-weight: bold;
  color: #e2e8f0;
}

.change.up {
  color: #10b981;
}

.change.down {
  color: #ef4444;
}

/* Calculator */
.calculator-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.input-section {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #94a3b8;
}

.form-group input {
  width: 100%;
  padding: 10px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
}

.calc-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.result-section {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
}

.result-card {
  background: #0f172a;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.result-label {
  color: #94a3b8;
  margin-bottom: 8px;
}

.result-value {
  color: #3b82f6;
  font-size: 36px;
  font-weight: bold;
}

/* Strategy */
.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.strategy-item {
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
}

.strategy-item h3 {
  color: #e2e8f0;
  margin-bottom: 8px;
}

.strategy-item p {
  color: #94a3b8;
}

/* Portfolio */
.portfolio-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.summary-label {
  color: #94a3b8;
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

/* Greeks */
.greeks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.greek-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.greek-name {
  color: #94a3b8;
  margin-bottom: 8px;
}

.greek-value {
  color: #e2e8f0;
  font-size: 24px;
  font-weight: bold;
}
</style>
