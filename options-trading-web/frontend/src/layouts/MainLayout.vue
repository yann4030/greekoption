<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <span class="logo-icon">📊</span>
        <span class="logo-text">期权交易</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="nav-menu"
        background-color="#1e293b"
        text-color="#94a3b8"
        active-text-color="#60a5fa"
        router
      >
        <el-menu-item index="/">
          <el-icon><DataLine /></el-icon>
          <span>行情看板</span>
        </el-menu-item>
        
        <el-menu-item index="/calculator">
          <el-icon><Calculator /></el-icon>
          <span>期权计算器</span>
        </el-menu-item>
        
        <el-menu-item index="/strategy">
          <el-icon><TrendCharts /></el-icon>
          <span>策略分析</span>
        </el-menu-item>
        
        <el-menu-item index="/portfolio">
          <el-icon><Wallet /></el-icon>
          <span>持仓管理</span>
        </el-menu-item>
        
        <el-menu-item index="/greeks">
          <el-icon><PieChart /></el-icon>
          <span>Greeks分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <market-status />
        </div>
        <div class="header-right">
          <span class="time">{{ currentTime }}</span>
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              用户
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRoute } from "vue-router"
import MarketStatus from "@/components/MarketStatus.vue"

const route = useRoute()
const currentTime = ref("")
let timer: number

const activeMenu = computed(() => route.path)

const updateTime = () => {
  currentTime.value = new Date().toLocaleString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background: #1e293b;
  border-right: 1px solid #334155;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid #334155;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.nav-menu {
  border-right: none;
}

.header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.time {
  color: #94a3b8;
  font-size: 14px;
}

.user-info {
  color: #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.main-content {
  background: #0f172a;
  padding: 20px;
  overflow-y: auto;
}
</style>
