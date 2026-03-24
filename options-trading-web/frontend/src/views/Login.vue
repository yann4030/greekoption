<template>
  <div class="login">
    <el-card class="login-card">
      <template #header><h2>期权交易平台</h2></template>
      <el-form :model="form" label-position="top">
        <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" type="password" /></el-form-item>
        <el-button type="primary" style="width:100%" @click="login">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue"
import { useRouter } from "vue-router"
const router = useRouter()
const form = reactive({ username: "", password: "" })
const login = () => { localStorage.setItem("token", "demo"); router.push("/") }
</script>
<style scoped>
.login{height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a}
.login-card{width:400px}
</style>
