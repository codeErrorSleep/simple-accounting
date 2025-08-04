<template>
  <div class="space-y-6">
    <!-- 页面标题和筛选 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">统计分析</h2>
        <select
          v-model="selectedPeriod"
          @change="updateData"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="year">本年</option>
        </select>
      </div>
      
      <!-- 总览卡片 -->
      <div class="grid grid-cols-3 gap-3">
        <div class="text-center p-3 bg-red-50 rounded-lg">
          <div class="text-lg font-bold text-red-600">¥{{ formatAmount(totalExpense) }}</div>
          <div class="text-xs text-red-500">总支出</div>
        </div>
        <div class="text-center p-3 bg-blue-50 rounded-lg">
          <div class="text-lg font-bold text-blue-600">{{ expenseCount }}</div>
          <div class="text-xs text-blue-500">笔数</div>
        </div>
        <div class="text-center p-3 bg-green-50 rounded-lg">
          <div class="text-lg font-bold text-green-600">¥{{ formatAmount(avgExpense) }}</div>
          <div class="text-xs text-green-500">平均</div>
        </div>
      </div>
    </div>
    
    <!-- 分类支出饼图 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">分类支出分布</h3>
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
      <div v-else-if="categoryData.length === 0" class="text-center py-12">
        <div class="text-4xl mb-2">📊</div>
        <p class="text-gray-500">暂无数据</p>
      </div>
      <div v-else class="relative">
        <canvas ref="pieChartRef" class="max-h-64 mx-auto"></canvas>
      </div>
    </div>
    
    <!-- 趋势图表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">支出趋势</h3>
      <div v-if="loading" class="flex items-center justify-center h-48">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
      <div v-else-if="trendData.length === 0" class="text-center py-12">
        <div class="text-4xl mb-2">📈</div>
        <p class="text-gray-500">暂无数据</p>
      </div>
      <div v-else class="relative">
        <canvas ref="lineChartRef" class="max-h-48"></canvas>
      </div>
    </div>
    
    <!-- 分类详情列表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">分类详情</h3>
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div class="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
      <div v-else-if="categoryStats.length === 0" class="text-center py-8">
        <div class="text-4xl mb-2">📋</div>
        <p class="text-gray-500">暂无分类数据</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="stat in categoryStats"
          :key="stat.category_id"
          class="flex items-center justify-between py-3 border-b border-gray-50 last:border-b-0"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
                 :style="{ backgroundColor: stat.color + '20' }">
              <span class="text-lg">{{ stat.icon }}</span>
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ stat.name }}</div>
              <div class="text-sm text-gray-500">{{ stat.count }} 笔记录</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-gray-900">¥{{ formatAmount(stat.amount) }}</div>
            <div class="text-sm text-gray-500">{{ stat.percentage }}%</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 最近记录 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">最近记录</h3>
        <router-link
          to="/record"
          class="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          添加记录
        </router-link>
      </div>
      
      <div v-if="recentExpenses.length === 0" class="text-center py-8">
        <div class="text-4xl mb-2">💰</div>
        <p class="text-gray-500">还没有支出记录</p>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="expense in recentExpenses"
          :key="expense.id"
          class="flex items-center justify-between py-2"
        >
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center"
                 :style="{ backgroundColor: getCategoryColor(expense.category_id) + '20' }">
              <span class="text-sm">{{ getCategoryIcon(expense.category_id) }}</span>
            </div>
            <div>
              <div class="font-medium text-gray-900 text-sm">
                {{ expense.description || getCategoryName(expense.category_id) }}
              </div>
              <div class="text-xs text-gray-500">{{ formatDate(expense.expense_date) }}</div>
            </div>
          </div>
          <div class="font-semibold text-gray-900">¥{{ formatAmount(expense.amount) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useExpenseStore, useCategoryStore } from '@/stores'
import type { Expense } from '@/lib/supabase'

// 注册 Chart.js 组件
Chart.register(...registerables)

const expenseStore = useExpenseStore()
const categoryStore = useCategoryStore()

// 状态
const loading = ref(true)
const selectedPeriod = ref('month')
const pieChartRef = ref<HTMLCanvasElement>()
const lineChartRef = ref<HTMLCanvasElement>()
let pieChart: Chart | null = null
let lineChart: Chart | null = null

// 筛选后的支出数据
const filteredExpenses = computed(() => {
  const now = new Date()
  const expenses = expenseStore.expenses
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date)
    
    switch (selectedPeriod.value) {
      case 'week':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        return expenseDate >= weekStart
        
      case 'month':
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear()
               
      case 'year':
        return expenseDate.getFullYear() === now.getFullYear()
        
      default:
        return true
    }
  })
})

// 统计数据
const totalExpense = computed(() => {
  return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const expenseCount = computed(() => filteredExpenses.value.length)

const avgExpense = computed(() => {
  return expenseCount.value > 0 ? totalExpense.value / expenseCount.value : 0
})

// 分类统计
const categoryStats = computed(() => {
  const stats = new Map()
  
  filteredExpenses.value.forEach(expense => {
    const categoryId = expense.category_id
    const category = categoryStore.categories.find(c => c.id === categoryId)
    
    if (!stats.has(categoryId)) {
      stats.set(categoryId, {
        category_id: categoryId,
        name: category?.name || '未知分类',
        icon: category?.icon || '💰',
        color: category?.color || '#4CAF50',
        amount: 0,
        count: 0
      })
    }
    
    const stat = stats.get(categoryId)
    stat.amount += expense.amount
    stat.count += 1
  })
  
  const result = Array.from(stats.values())
  
  // 计算百分比
  result.forEach(stat => {
    stat.percentage = totalExpense.value > 0 
      ? Math.round((stat.amount / totalExpense.value) * 100)
      : 0
  })
  
  // 按金额排序
  return result.sort((a, b) => b.amount - a.amount)
})

// 饼图数据
const categoryData = computed(() => {
  return categoryStats.value.map(stat => ({
    label: stat.name,
    value: stat.amount,
    color: stat.color
  }))
})

// 趋势数据
const trendData = computed(() => {
  const data = new Map()
  
  filteredExpenses.value.forEach(expense => {
    const date = expense.expense_date
    if (!data.has(date)) {
      data.set(date, 0)
    }
    data.set(date, data.get(date) + expense.amount)
  })
  
  return Array.from(data.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }))
})

// 最近记录
const recentExpenses = computed(() => {
  return filteredExpenses.value.slice(0, 10)
})

// 格式化金额
function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 获取分类信息
function getCategoryIcon(categoryId: string): string {
  const category = categoryStore.categories.find(c => c.id === categoryId)
  return category?.icon || '💰'
}

function getCategoryName(categoryId: string): string {
  const category = categoryStore.categories.find(c => c.id === categoryId)
  return category?.name || '其他'
}

function getCategoryColor(categoryId: string): string {
  const category = categoryStore.categories.find(c => c.id === categoryId)
  return category?.color || '#4CAF50'
}

// 创建饼图
function createPieChart() {
  if (!pieChartRef.value || categoryData.value.length === 0) return
  
  if (pieChart) {
    pieChart.destroy()
  }
  
  const ctx = pieChartRef.value.getContext('2d')
  if (!ctx) return
  
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.value.map(item => item.label),
      datasets: [{
        data: categoryData.value.map(item => item.value),
        backgroundColor: categoryData.value.map(item => item.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  })
}

// 创建趋势图
function createLineChart() {
  if (!lineChartRef.value || trendData.value.length === 0) return
  
  if (lineChart) {
    lineChart.destroy()
  }
  
  const ctx = lineChartRef.value.getContext('2d')
  if (!ctx) return
  
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.value.map(item => formatDate(item.date)),
      datasets: [{
        label: '支出金额',
        data: trendData.value.map(item => item.amount),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '¥' + value
            }
          }
        }
      }
    }
  })
}

// 更新数据
async function updateData() {
  loading.value = true
  try {
    await expenseStore.fetchExpenses()
    await nextTick()
    createPieChart()
    createLineChart()
  } finally {
    loading.value = false
  }
}

// 监听数据变化
watch([categoryData, trendData], () => {
  nextTick(() => {
    createPieChart()
    createLineChart()
  })
})

// 初始化
onMounted(async () => {
  await categoryStore.fetchCategories()
  await updateData()
})
</script>