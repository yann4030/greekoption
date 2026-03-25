<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">GreekOption</div>
      <nav>
        <router-link to="/">Dashboard</router-link>
        <router-link to="/calculator">Calculator</router-link>
        <router-link to="/strategy">Strategy</router-link>
        <router-link to="/portfolio">Portfolio</router-link>
        <router-link to="/greeks">Greeks</router-link>
      </nav>
    </aside>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Layout component
</script>

<style scoped>
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
}

nav a:hover,
nav a.router-link-active {
  background: #3b82f6;
  color: white;
}

main {
  flex: 1;
  padding: 20px;
}
</style>
