<template>
  <div class="market-status">
    <span class="status-dot" :class="isOpen ? "open" : "closed""></span>
    <span class="status-text">{{ isOpen ? "交易中" : "已闭市" }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue"
const isOpen = computed(() => {
  const hour = new Date().getHours()
  return (hour >= 9 && hour < 11.5) || (hour >= 13 && hour < 15)
})
</script>
<style scoped>
.market-status{display:flex;align-items:center;gap:8px}
.status-dot{width:8px;height:8px;border-radius:50%}
.status-dot.open{background:#10b981}
.status-dot.closed{background:#ef4444}
.status-text{color:#94a3b8;font-size:14px}
</style>
