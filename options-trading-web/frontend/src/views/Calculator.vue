<template>
  <div class="calculator">
    <h1>Option Calculator</h1>
    
    <div class="calculator-grid">
      <!-- Input Section -->
      <div class="input-section">
        <h2>Parameters</h2>
        
        <div class="form-group">
          <label>Spot Price (S)</label>
          <input v-model.number="params.spot" type="number" step="0.001" />
        </div>
        
        <div class="form-group">
          <label>Strike Price (K)</label>
          <input v-model.number="params.strike" type="number" step="0.001" />
        </div>
        
        <div class="form-group">
          <label>Time to Maturity (T) in years</label>
          <input v-model.number="params.time" type="number" step="0.01" />
        </div>
        
        <div class="form-group">
          <label>Risk-free Rate (r) %</label>
          <input v-model.number="params.rate" type="number" step="0.1" />
        </div>
        
        <div class="form-group">
          <label>Volatility (sigma) %</label>
          <input v-model.number="params.vol" type="number" step="1" />
        </div>
        
        <div class="form-group">
          <label>Option Type</label>
          <select v-model="params.type">
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </div>
        
        <button class="calculate-btn" @click="calculate">Calculate</button>
      </div>
      
      <!-- Results Section -->
      <div class="results-section">
        <h2>Results</h2>
        
        <div class="result-card">
          <div class="result-label">Option Price</div>
          <div class="result-value">{{ result.price.toFixed(4) }}</div>
        </div>
        
        <div class="greeks-grid">
          <div class="greek-card">
            <div class="greek-label">Delta</div>
            <div class="greek-value">{{ result.delta.toFixed(4) }}</div>
          </div>
          
          <div class="greek-card">
            <div class="greek-label">Gamma</div>
            <div class="greek-value">{{ result.gamma.toFixed(4) }}</div>
          </div>
          
          <div class="greek-card">
            <div class="greek-label">Theta</div>
            <div class="greek-value">{{ result.theta.toFixed(4) }}</div>
          </div>
          
          <div class="greek-card">
            <div class="greek-label">Vega</div>
            <div class="greek-value">{{ result.vega.toFixed(4) }}</div>
          </div>
          
          <div class="greek-card">
            <div class="greek-label">Rho</div>
            <div class="greek-value">{{ result.rho.toFixed(4) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Params {
  spot: number
  strike: number
  time: number
  rate: number
  vol: number
  type: 'call' | 'put'
}

interface Result {
  price: number
  delta: number
  gamma: number
  theta: number
  vega: number
  rho: number
}

const params = ref<Params>({
  spot: 4.445,
  strike: 4.500,
  time: 0.25,
  rate: 3.0,
  vol: 20.0,
  type: 'call'
})

const result = ref<Result>({
  price: 0,
  delta: 0,
  gamma: 0,
  theta: 0,
  vega: 0,
  rho: 0
})

// Standard normal CDF
const normalCDF = (x: number): number => {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)
  
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  
  return 0.5 * (1 + sign * y)
}

// Standard normal PDF
const normalPDF = (x: number): number => {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI)
}

const calculate = () => {
  const S = params.value.spot
  const K = params.value.strike
  const T = params.value.time
  const r = params.value.rate / 100
  const sigma = params.value.vol / 100
  const isCall = params.value.type === 'call'
  
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
  const d2 = d1 - sigma * Math.sqrt(T)
  
  const Nd1 = normalCDF(d1)
  const Nd2 = normalCDF(d2)
  const NNegD1 = normalCDF(-d1)
  const NNegD2 = normalCDF(-d2)
  
  // Price
  if (isCall) {
    result.value.price = S * Nd1 - K * Math.exp(-r * T) * Nd2
  } else {
    result.value.price = K * Math.exp(-r * T) * NNegD2 - S * NNegD1
  }
  
  // Greeks
  result.value.delta = isCall ? Nd1 : Nd1 - 1
  result.value.gamma = normalPDF(d1) / (S * sigma * Math.sqrt(T))
  result.value.theta = -(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T)) - 
    r * K * Math.exp(-r * T) * (isCall ? Nd2 : -NNegD2)
  result.value.vega = S * normalPDF(d1) * Math.sqrt(T)
  result.value.rho = K * T * Math.exp(-r * T) * (isCall ? Nd2 : -NNegD2)
}

onMounted(() => {
  calculate()
})
</script>

<style scoped>
.calculator {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #e2e8f0;
}

.calculator-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .calculator-grid {
    grid-template-columns: 1fr;
  }
}

.input-section, .results-section {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
}

h2 {
  margin-bottom: 20px;
  color: #e2e8f0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.calculate-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.calculate-btn:hover {
  background: #2563eb;
}

.result-card {
  background: #0f172a;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.result-label {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 8px;
}

.result-value {
  color: #3b82f6;
  font-size: 36px;
  font-weight: bold;
}

.greeks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.greek-card {
  background: #0f172a;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.greek-label {
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 8px;
}

.greek-value {
  color: #e2e8f0;
  font-size: 20px;
  font-weight: 600;
}
</style>
