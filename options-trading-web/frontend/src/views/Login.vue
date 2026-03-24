<template>
  <div class="login">
    <div class="login-box">
      <h1>GreekOption</h1>
      <p>Options Trading Platform</p>
      <button @click="login">Login</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const login = () => {
  localStorage.setItem('token', 'demo')
  router.push('/')
}
</script>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
}

.login-box {
  text-align: center;
  color: #e2e8f0;
}

button {
  padding: 10px 30px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
