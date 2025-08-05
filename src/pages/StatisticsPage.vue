<template>
  <div class="space-y-6">
    <!-- 页面标题和标签页 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">{{ $t('statistics.title') }}</h2>
        <select
          v-model="selectedPeriod"
          @change="updateData"
          class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="week">{{ $t('statistics.thisWeek') }}</option>
          <option value="month">{{ $t('statistics.thisMonth') }}</option>
          <option value="year">{{ $t('statistics.thisYear') }}</option>
        </select>
      </div>
      
      <!-- 标签页导航 -->
      <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          @click="activeTab = 'overview'"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === 'overview'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ $t('statistics.overview') }}
        </button>
        <button
          @click="activeTab = 'prediction'"
          :class="[
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === 'prediction'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ $t('statistics.trendPrediction') }}
        </button>
      </div>
      
    </div>
    
    <!-- 标签页内容 -->
    <div v-if="activeTab === 'overview'">
      <!-- 总览卡片 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="grid grid-cols-3 gap-3">
          <div class="text-center p-3 bg-red-50 rounded-lg">
            <div class="text-lg font-bold text-red-600">¥{{ formatAmount(totalExpense) }}</div>
            <div class="text-xs text-red-500">{{ $t('statistics.totalExpense') }}</div>
          </div>
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-lg font-bold text-blue-600">{{ expenseCount }}</div>
            <div class="text-xs text-blue-500">{{ $t('statistics.count') }}</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-lg font-bold text-green-600">¥{{ formatAmount(avgExpense) }}</div>
            <div class="text-xs text-green-500">{{ $t('statistics.average') }}</div>
          </div>
        </div>
      </div>
    
    <!-- 分类支出饼图 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">{{ $t('statistics.categoryDistribution') }}</h3>
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
      <div v-else-if="categoryData.length === 0" class="text-center py-12">
        <div class="text-4xl mb-2">📊</div>
        <p class="text-gray-500">{{ $t('statistics.noData') }}</p>
      </div>
      <div v-else class="relative">
        <canvas ref="pieChartRef" class="max-h-64 mx-auto"></canvas>
      </div>
    </div>
    
    <!-- 趋势图表 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">{{ $t('statistics.expenseTrend') }}</h3>
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
      <h3 class="font-semibold text-gray-900 mb-4">{{ $t('statistics.categoryDetails') }}</h3>
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
        <p class="text-gray-500">{{ $t('statistics.noCategoryData') }}</p>
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
              <div class="text-sm text-gray-500">{{ stat.count }} {{ $t('statistics.records') }}</div>
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
          <h3 class="font-semibold text-gray-900">{{ $t('statistics.recentRecords') }}</h3>
          <router-link
            to="/record"
            class="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {{ $t('statistics.addRecord') }}
          </router-link>
        </div>
        
        <div v-if="recentExpenses.length === 0" class="text-center py-8">
          <div class="text-4xl mb-2">💰</div>
          <p class="text-gray-500">{{ $t('statistics.noExpenseRecords') }}</p>
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
    
    <!-- 趋势预测标签页 -->
    <div v-else-if="activeTab === 'prediction'" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <TrendPredictionChart />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useExpenseStore, useCategoryStore } from '@/stores'
import TrendPredictionChart from '@/components/TrendPredictionChart.vue'
import type { Expense } from '@/lib/supabase'

// 注册 Chart.js 组件
Chart.register(...registerables)

const expenseStore = useExpenseStore()
const categoryStore = useCategoryStore()

// 状态
const loading = ref(true)
const selectedPeriod = ref('month')
const activeTab = ref('overview')
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
  if (!pieChartRef.value) {
    console.log('饼图canvas元素未找到')
    return
  }
  
  if (categoryData.value.length === 0) {
    console.log('没有分类数据，显示空状态')
    // 显示空状态
    const ctx = pieChartRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, pieChartRef.value.width, pieChartRef.value.height)
      ctx.fillStyle = '#666'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('暂无数据', pieChartRef.value.width / 2, pieChartRef.value.height / 2)
    }
    return
  }
  
  if (pieChart) {
    pieChart.destroy()
  }
  
  const ctx = pieChartRef.value.getContext('2d')
  if (!ctx) return
  
  try {
    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryData.value.map(item => item.label),
        datasets: [{
          data: categoryData.value.map(item => item.value),
          backgroundColor: categoryData.value.map(item => item.color),
          borderWidth: 2,
          borderColor: '#fff',
          hoverBorderWidth: 3,
          hoverBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.parsed
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ¥${value.toFixed(2)} (${percentage}%)`
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 1000
        }
      }
    })
    console.log('饼图创建成功，数据条数:', categoryData.value.length)
  } catch (error) {
    console.error('创建饼图失败:', error)
  }
}

// 创建趋势图
function createLineChart() {
  if (!lineChartRef.value) {
    console.log('趋势图canvas元素未找到')
    return
  }
  
  if (trendData.value.length === 0) {
    console.log('没有趋势数据，显示空状态')
    // 显示空状态
    const ctx = lineChartRef.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, lineChartRef.value.width, lineChartRef.value.height)
      ctx.fillStyle = '#666'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('暂无数据', lineChartRef.value.width / 2, lineChartRef.value.height / 2)
    }
    return
  }
  
  if (lineChart) {
    lineChart.destroy()
  }
  
  const ctx = lineChartRef.value.getContext('2d')
  if (!ctx) return
  
  try {
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
          tension: 0.4,
          pointBackgroundColor: '#4CAF50',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#4CAF50',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `支出: ¥${context.parsed.y.toFixed(2)}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: {
                size: 11
              },
              callback: function(value) {
                 return '¥' + Number(value).toFixed(0)
               }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    })
    console.log('趋势图创建成功，数据点数:', trendData.value.length)
  } catch (error) {
    console.error('创建趋势图失败:', error)
  }
}

// 更新数据
async function updateData() {
  loading.value = true
  try {
    console.log('开始更新数据...')
    await expenseStore.fetchExpenses()
    console.log('支出数据获取完成，条数:', expenseStore.expenses.length)
    
    await nextTick()
    
    // 延迟一下确保DOM完全渲染
    setTimeout(() => {
      createPieChart()
      createLineChart()
    }, 100)
  } catch (error) {
    console.error('更新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听数据变化
watch([categoryData, trendData], () => {
  console.log('数据变化，重新创建图表')
  console.log('分类数据:', categoryData.value.length, '趋势数据:', trendData.value.length)
  
  nextTick(() => {
    setTimeout(() => {
      createPieChart()
      createLineChart()
    }, 50)
  })
}, { deep: true })

// 监听时间范围变化
watch(selectedPeriod, () => {
  console.log('时间范围变化:', selectedPeriod.value)
  nextTick(() => {
    setTimeout(() => {
      createPieChart()
      createLineChart()
    }, 50)
  })
})

// 初始化
onMounted(async () => {
  console.log('统计页面初始化...')
  
  try {
    await categoryStore.fetchCategories()
    console.log('分类数据获取完成，条数:', categoryStore.categories.length)
    
    await updateData()
    
    console.log('统计页面初始化完成')
  } catch (error) {
    console.error('统计页面初始化失败:', error)
  }
})
</script>