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
        meta: { title: "Dashboard" },
      },
      {
        path: "calculator",
        name: "Calculator",
        component: () => import("@/views/Calculator.vue"),
        meta: { title: "Calculator" },
      },
      {
        path: "strategy",
        name: "Strategy",
        component: () => import("@/views/Strategy.vue"),
        meta: { title: "Strategy" },
      },
      {
        path: "portfolio",
        name: "Portfolio",
        component: () => import("@/views/Portfolio.vue"),
        meta: { title: "Portfolio" },
      },
      {
        path: "greeks",
        name: "Greeks",
        component: () => import("@/views/Greeks.vue"),
        meta: { title: "Greeks" },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { title: "Login", public: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - GreekOption` : "GreekOption"
  next()
})

export default router
