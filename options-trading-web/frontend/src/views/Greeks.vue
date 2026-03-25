<template>
  <div class="greeks">
    <h1>Greeks Analysis</h1>
    
    <div class="greeks-dashboard">
      <div class="greek-card delta">
        <div class="greek-icon">Δ</div>
        <div class="greek-info">
          <div class="greek-name">Delta</div>
          <div class="greek-desc">Price sensitivity to underlying</div>
        </div>
        <div class="greek-value">0.45</div>
      </div>
      
      <div class="greek-card gamma">
        <div class="greek-icon">Γ</div>
        <div class="greek-info">
          <div class="greek-name">Gamma</div>
          <div class="greek-desc">Delta sensitivity to underlying</div>
        </div>
        <div class="greek-value">0.08</div>
      </div>
      
      <div class="greek-card theta">
        <div class="greek-icon">Θ</div>
        <div class="greek-info">
          <div class="greek-name">Theta</div>
          <div class="greek-desc">Time decay per day</div>
        </div>
        <div class="greek-value">-0.12</div>
      </div>
      
      <div class="greek-card vega">
        <div class="greek-icon">V</div>
        <div class="greek-info">
          <div class="greek-name">Vega</div>
          <div class="greek-desc">Sensitivity to volatility</div>
        </div>
        <div class="greek-value">1.25</div>
      </div>
      
      <div class="greek-card rho">
        <div class="greek-icon">ρ</div>
        <div class="greek-info">
          <div class="greek-name">Rho</div>
          <div class="greek-desc">Sensitivity to interest rate</div>
        </div>
        <div class="greek-value">0.32</div>
      </div>
    </div>
    
    <div class="explanation-section">
      <h2>Greeks Explained</h2>
      
      <div class="explanation-grid">
        <div class="explanation-card">
          <h3>Delta (Δ)</h3>
          <p>Measures the rate of change of the option price with respect to changes in the underlying asset's price.</p>
          <ul>
            <li>Call Delta: 0 to 1</li>
            <li>Put Delta: -1 to 0</li>
            <li>ATM options: ~0.5</li>
          </ul>
        </div>
        
        <div class="explanation-card">
          <h3>Gamma (Γ)</h3>
          <p>Measures the rate of change of Delta with respect to changes in the underlying price.</p>
          <ul>
            <li>Highest for ATM options</li>
            <li>Increases as expiration approaches</li>
            <li>Always positive for long options</li>
          </ul>
        </div>
        
        <div class="explanation-card">
          <h3>Theta (Θ)</h3>
          <p>Measures the rate of decline in the value of an option due to the passage of time.</p>
          <ul>
            <li>Usually negative for long options</li>
            <li>Accelerates near expiration</li>
            >li>Higher for ATM options</li>
          </ul>
        </div>
        
        <div class="explanation-card">
          <h3>Vega (V)</h3>
          <p>Measures sensitivity to volatility. Higher Vega means the option price is more sensitive to volatility changes.</p>
          <ul>
            <li>Higher for longer-dated options</li>
            <li>Highest for ATM options</li>
            >li>Decreases as expiration approaches</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Greeks component
</script>

<style scoped>
.greeks {
  padding: 20px;
}

h1, h2 {
  margin-bottom: 20px;
  color: #e2e8f0;
}

.greeks-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.greek-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid;
}

.greek-card.delta { border-color: #3b82f6; }
.greek-card.gamma { border-color: #10b981; }
.greek-card.theta { border-color: #f59e0b; }
.greek-card.vega { border-color: #8b5cf6; }
.greek-card.rho { border-color: #ef4444; }

.greek-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.delta .greek-icon { background: #3b82f6; }
.gamma .greek-icon { background: #10b981; }
.theta .greek-icon { background: #f59e0b; }
.vega .greek-icon { background: #8b5cf6; }
.rho .greek-icon { background: #ef4444; }

.greek-info {
  flex: 1;
}

.greek-name {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.greek-desc {
  color: #94a3b8;
  font-size: 12px;
}

.greek-value {
  color: #e2e8f0;
  font-size: 24px;
  font-weight: bold;
}

.explanation-section {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
}

.explanation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.explanation-card {
  background: #0f172a;
  border-radius: 8px;
  padding: 20px;
}

.explanation-card h3 {
  color: #3b82f6;
  margin-bottom: 12px;
}

.explanation-card p {
  color: #94a3b8;
  margin-bottom: 12px;
  line-height: 1.5;
}

.explanation-card ul {
  color: #e2e8f0;
  padding-left: 20px;
}

.explanation-card li {
  margin-bottom: 4px;
}
</style>
