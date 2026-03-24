import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { ETFQuote, OptionPriceRequest, OptionPriceResponse } from "@/types"
import * as api from "@/api"

export const useMarketStore = defineStore("market", () => {
  // State
  const etfList = ref<ETFQuote[]>([])
  const currentETF = ref<ETFQuote | null>(null)
  const loading = ref(false)
  const lastUpdate = ref<Date | null>(null)

  // Getters
  const sortedETFs = computed(() => {
    return [...etfList.value].sort((a, b) => b.change_pct - a.change_pct)
  })

  const bestRecommendation = computed(() => {
    if (etfList.value.length === 0) return null
    return etfList.value.reduce((best, current) =>
      current.iv > best.iv ? current : best
    )
  })

  // Actions
  const fetchETFList = async () => {
    loading.value = true
    try {
      const data = await api.getETFList()
      etfList.value = data
      lastUpdate.value = new Date()
    } catch (error) {
      console.error("获取ETF列表失败:", error)
    } finally {
      loading.value = false
    }
  }

  const selectETF = (symbol: string) => {
    currentETF.value = etfList.value.find(e => e.symbol === symbol) || null
  }

  // 自动刷新
  const startAutoRefresh = (interval = 5000) => {
    fetchETFList()
    return setInterval(fetchETFList, interval)
  }

  return {
    etfList,
    currentETF,
    loading,
    lastUpdate,
    sortedETFs,
    bestRecommendation,
    fetchETFList,
    selectETF,
    startAutoRefresh,
  }
})

export const useCalculatorStore = defineStore("calculator", () => {
  const result = ref<OptionPriceResponse | null>(null)
  const loading = ref(false)

  const calculate = async (params: OptionPriceRequest) => {
    loading.value = true
    try {
      const data = await api.calculatePrice(params)
      result.value = data
      return data
    } catch (error) {
      console.error("计算失败:", error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    result,
    loading,
    calculate,
  }
})
