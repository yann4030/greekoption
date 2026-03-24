import { createRouter, createWebHistory } from "vue-router"
import type { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Layout",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: { title: "行情看板" },
      },
      {
        path: "calculator",
        name: "Calculator",
        component: () => import("@/views/Calculator.vue"),
        meta: { title: "期权计算器" },
      },
      {
        path: "strategy",
        name: "Strategy",
        component: () => import("@/views/Strategy.vue"),
        meta: { title: "策略分析" },
      },
      {
        path: "portfolio",
        name: "Portfolio",
        component: () => import("@/views/Portfolio.vue"),
        meta: { title: "持仓管理" },
      },
      {
        path: "greeks",
        name: "Greeks",
        component: () => import("@/views/Greeks.vue"),
        meta: { title: "Greeks分析" },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "登录", public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 期权交易平台` : "期权交易平台"
  next()
})

export default router
