<template>
  <div class="portfolio">
    <!-- 持仓概览 -->
    <el-row :gutter="20" class="summary-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="summary-item">
            <div class="summary-label">总持仓市值</div>
            <div class="summary-value">{{ formatMoney(summary.total_value) }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="summary-item">
            <div class="summary-label">总盈亏</div>
            <div class="summary-value" :class="summary.total_pnl >= 0 ? "positive" : "negative"">
              {{ summary.total_pnl >= 0 ? "+" : "" }}{{ formatMoney(summary.total_pnl) }}
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="summary-item">
            <div class="summary-label">持仓数量</div>
            <div class="summary-value">{{ positions.length }} 笔</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover">
          <div class="summary-item">
            <div class="summary-label">今日盈亏</div>
            <div class="summary-value" :class="summary.daily_pnl >= 0 ? "positive" : "negative"">
              {{ summary.daily_pnl >= 0 ? "+" : "" }}{{ formatMoney(summary.daily_pnl) }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 操作栏 -->
    <el-row class="action-row">
      <el-col :span="24">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加持仓
        </el-button>
        
        <el-button :loading="loading" @click="refreshPositions">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </el-col>
    </el-row>
    
    <!-- 持仓列表 -->
    <el-row
      <el-col :span="24">
        <el-card shadow="hover">
          <el-table :data="positions" v-loading="loading" style="width: 100%">
            <el-table-column prop="symbol" label="期权代码" width="150" />
            
            <el-table-column label="标的" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.underlying }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <span :class="row.option_type">
                  {{ row.option_type === "call" ? "看涨" : "看跌" }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="strike" label="行权价" width="100">
              <template #default="{ row }">
                {{ row.strike.toFixed(3) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="expiry" label="到期日" width="120" />
            
            <el-table-column label="方向" width="80">
              <template #default="{ row }">
                <el-tag :type="row.side === "long" ? "success" : "danger"" size="small">
                  {{ row.side === "long" ? "买入" : "卖出" }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="quantity" label="数量" width="80" />
            
            <el-table-column label="成本价" width="100">
              <template #default="{ row }">
                {{ row.entry_price.toFixed(4) }}
              </template>
            </el-table-column>
            
            <el-table-column label="现价" width="100">
              <template #default="{ row }">
                {{ row.current_price.toFixed(4) }}
              </template>
            </el-table-column>
            
            <el-table-column label="盈亏" width="120">
              <template #default="{ row }">
                <span :class="row.pnl >= 0 ? "positive" : "negative"">
                  {{ row.pnl >= 0 ? "+" : "" }}{{ formatMoney(row.pnl) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="deletePosition(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 空状态 -->
          <el-empty v-if="positions.length === 0 && !loading" description="暂无持仓" />
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 添加持仓对话框 -->
    <el-dialog v-model="dialogVisible" title="添加持仓" width="500px">
      <el-form :model="form" label-position="top" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="期权代码" prop="symbol">
              <el-input v-model="form.symbol" placeholder="如: 510050C2404M02500" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="标的" prop="underlying">
              <el-select v-model="form.underlying" style="width: 100%">
                <el-option label="50ETF" value="510050" />
                <el-option label="300ETF" value="510300" />
                <el-option label="500ETF" value="510500" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="期权类型" prop="option_type">
              <el-radio-group v-model="form.option_type">
                <el-radio-button label="call">看涨</el-radio-button>
                <el-radio-button label="put">看跌</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="方向" prop="side">
              <el-radio-group v-model="form.side">
                <el-radio-button label="long">买入</el-radio-button>
                <el-radio-button label="short">卖出</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行权价" prop="strike">
              <el-input-number v-model="form.strike" :precision="3" :step="0.05" style="width: 100%" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="到期日" prop="expiry">
              <el-date-picker v-model="form.expiry" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="成本价" prop="entry_price">
              <el-input-number v-model="form.entry_price" :precision="4" :step="0.0001" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import * as api from "@/api"

const loading = ref(false)
const positions = ref<any[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const summary = ref({
  total_value: 0,
  total_pnl: 0,
  daily_pnl: 0,
})

const form = reactive({
  symbol: "",
  underlying: "510300",
  option_type: "call",
  strike: 4.3,
  expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  side: "long",
  quantity: 1,
  entry_price: 0.05,
})

const rules: FormRules = {
  symbol: [{ required: true, message: "请输入期权代码", trigger: "blur" }],
  underlying: [{ required: true, message: "请选择标的", trigger: "change" }],
  option_type: [{ required: true, message: "请选择期权类型", trigger: "change" }],
  strike: [{ required: true, message: "请输入行权价", trigger: "blur" }],
  expiry: [{ required: true, message: "请选择到期日", trigger: "change" }],
  side: [{ required: true, message: "请选择方向", trigger: "change" }],
  quantity: [{ required: true, message: "请输入数量", trigger: "blur" }],
  entry_price: [{ required: true, message: "请输入成本价", trigger: "blur" }],
}

onMounted(() => {
  fetchPositions()
})

const fetchPositions = async () => {
  loading.value = true
  try {
    const data = await api.getPositions()
    positions.value = data
    calculateSummary()
  } catch (error) {
    console.error("获取持仓失败:", error)
    ElMessage.error("获取持仓失败")
  } finally {
    loading.value = false
  }
}

const calculateSummary = () => {
  let totalValue = 0
  let totalPnl = 0
  
  positions.value.forEach(p => {
    totalValue += p.current_price * p.quantity * 10000
    totalPnl += p.pnl
  })
  
  summary.value = {
    total_value: totalValue,
    total_pnl: totalPnl,
    daily_pnl: 0, // TODO: 计算今日盈亏
  }
}

const refreshPositions = () => {
  fetchPositions()
}

const showAddDialog = () => {
  dialogVisible.value = true
  // 重置表单
  form.symbol = ""
  form.strike = 4.3
  form.quantity = 1
  form.entry_price = 0.05
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await api.createPosition({
          ...form,
          expiry: form.expiry.toISOString().split("T")[0],
        })
        ElMessage.success("添加成功")
        dialogVisible.value = false
        fetchPositions()
      } catch (error) {
        console.error("添加持仓失败:", error)
        ElMessage.error("添加持仓失败")
      } finally {
        submitting.value = false
      }
    }
  })
}

const deletePosition = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定删除该持仓?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
    
    await api.deletePosition(id)
    ElMessage.success("删除成功")
    fetchPositions()
  } catch (error) {
    // 用户取消
  }
}

const formatMoney = (value: number) => {
  return "¥" + value.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
</script>

<style scoped>
.portfolio {
  padding: 0;
}

.summary-row {
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 10px 0;
}

.summary-label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #e2e8f0;
}

.action-row {
  margin-bottom: 20px;
}

.call {
  color: #ef4444;
}

.put {
  color: #10b981;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}
</style>
