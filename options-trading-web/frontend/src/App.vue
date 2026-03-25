<template>
  <div id="app">
    <div class="layout">
      <aside class="sidebar">
        <div class="logo">GreekOption</div>
        <nav>
          <button @click="page = 'dashboard'">Dashboard</button>
          <button @click="page = 'calculator'">Calculator</button>
          <button @click="page = 'strategy'">Strategy</button>
          <button @click="page = 'portfolio'">Portfolio</button>
          <button @click="page = 'greeks'">Greeks</button>
        </nav>
      </aside>
      <main>
        <div v-if="page === 'dashboard'">
          <h1>Dashboard Page</h1>
          <p>This is the dashboard</p>
        </div>
        <div v-if="page === 'calculator'">
          <h1>Calculator Page</h1>
          <p>This is the calculator</p>
        </div>
        <div v-if="page === 'strategy'">
          <h1>Strategy Page</h1>
          <p>This is the strategy page</p>
        </div>
        <div v-if="page === 'portfolio'">
          <h1>Portfolio Page</h1>
          <p>This is the portfolio</p>
        </div>
        <div v-if="page === 'greeks'">
          <h1>Greeks Page</h1>
          <p>This is the greeks page</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const page = ref('dashboard')
</script>

<style>
.layout { display: flex; min-height: 100vh; background: #0f172a; color: #e2e8f0; }
.sidebar { width: 200px; background: #1e293b; padding: 20px; }
.logo { font-size: 20px; font-weight: bold; color: #3b82f6; margin-bottom: 20px; }
nav { display: flex; flex-direction: column; gap: 10px; }
button { padding: 10px; background: #334155; color: #e2e8f0; border: none; border-radius: 6px; cursor: pointer; }
button:hover { background: #3b82f6; }
main { flex: 1; padding: 20px; }
h1 { margin-bottom: 20px; }
</style>
