<template>
  <div class="trend-prediction-chart">
    <!-- 控制面板 -->
    <div class="chart-controls mb-6 p-4 bg-green-50 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 分类选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('prediction.category') }}
          </label>
          <select 
            v-model="selectedCategory" 
            class="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">{{ $t('prediction.allCategories') }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.name">
              {{ $t(`categories.${cat.name}`) }}
            </option>
          </select>
        </div>
        
        <!-- 预测时间范围 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('prediction.timeRange') }}: {{ predictionMonths }}{{ $t('prediction.months') }}
          </label>
          <input 
            v-model="predictionMonths" 
            type="range" 
            min="1" 
            max="6" 
            class="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>1{{ $t('prediction.months') }}</span>
            <span>6{{ $t('prediction.months') }}</span>
          </div>
        </div>
        
        <!-- 算法选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('prediction.algorithm') }}
          </label>
          <select 
            v-model="selectedAlgorithm" 
            class="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="combined">{{ $t('prediction.combined') }}</option>
            <option value="linear">{{ $t('prediction.linear') }}</option>
            <option value="moving_average">{{ $t('prediction.movingAverage') }}</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 数据不足提示 -->
    <div v-if="!hasEnoughData" class="text-center py-12">
      <div class="text-gray-500 text-lg mb-4">
        <i class="fas fa-chart-line text-4xl mb-4 text-gray-300"></i>
        <p>{{ $t('prediction.insufficientData') }}</p>
        <p class="text-sm mt-2">{{ $t('prediction.needMoreData') }}</p>
      </div>
    </div>
    
    <!-- 图表容器 -->
    <div v-else class="chart-container bg-white rounded-lg shadow-sm p-4 mb-6">
      <canvas ref="chartCanvas" class="w-full h-80"></canvas>
    </div>
    
    <!-- 预测结果摘要 -->
    <div v-if="predictionResult" class="prediction-summary">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 下月预测 -->
        <div class="stat-card bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-green-700 mb-1">
                {{ $t('prediction.nextMonthPrediction') }}
              </h3>
              <p class="text-2xl font-bold text-green-600">
                ¥{{ predictionResult.predictedAmount.toFixed(2) }}
              </p>
            </div>
            <div class="text-green-500">
              <i class="fas fa-calendar-alt text-2xl"></i>
            </div>
          </div>
        </div>
        
        <!-- 趋势分析 -->
        <div class="stat-card bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-green-700 mb-1">
                {{ $t('prediction.trend') }}
              </h3>
              <p class="text-lg font-semibold" :class="trendClass">
                {{ $t(`prediction.${predictionResult.trend}`) }}
              </p>
            </div>
            <div :class="trendIconClass">
              <i :class="trendIcon" class="text-2xl"></i>
            </div>
          </div>
        </div>
        
        <!-- 置信度 -->
        <div class="stat-card bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-green-700 mb-1">
                {{ $t('prediction.confidence') }}
              </h3>
              <p class="text-lg font-semibold text-green-600">
                {{ (predictionResult.confidence * 100).toFixed(1) }}%
              </p>
              <div class="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: (predictionResult.confidence * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="text-green-500">
              <i class="fas fa-chart-bar text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 预测建议 -->
      <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 class="text-sm font-medium text-green-800 mb-2">
          <i class="fas fa-lightbulb mr-2"></i>
          {{ $t('prediction.suggestions') }}
        </h4>
        <p class="text-sm text-green-700">
          {{ getPredictionSuggestion() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { useTrendPrediction } from '@/composables/useTrendPrediction'
import { useExpenseStore, useCategoryStore } from '@/stores/index'
import { useI18n } from 'vue-i18n'

Chart.register(...registerables)

const expenseStore = useExpenseStore()
const categoryStore = useCategoryStore()
const { generatePrediction } = useTrendPrediction()
const { t } = useI18n()

const chartCanvas = ref(null)
const selectedCategory = ref('')
const predictionMonths = ref(3)
const selectedAlgorithm = ref<'linear' | 'moving_average' | 'combined'>('combined')
const predictionResult = ref(null)
const chart = ref(null)
const isLoading = ref(false)

const categories = computed(() => categoryStore.categories)
const expenses = computed(() => expenseStore.expenses)

// 检查是否有足够的数据
const hasEnoughData = computed(() => {
  let filteredExpenses = expenses.value
  if (selectedCategory.value) {
    const category = categories.value.find(c => c.name === selectedCategory.value)
    if (category) {
      filteredExpenses = expenses.value.filter(e => e.category_id === category.id)
    }
  }
  return filteredExpenses.length >= 10
})

// 趋势相关的计算属性
const trendClass = computed(() => {
  if (!predictionResult.value) return 'text-gray-600'
  switch (predictionResult.value.trend) {
    case 'increasing': return 'text-red-600'
    case 'decreasing': return 'text-green-600'
    case 'stable': return 'text-green-600'
    default: return 'text-gray-600'
  }
})

const trendIcon = computed(() => {
  if (!predictionResult.value) return 'fas fa-minus'
  switch (predictionResult.value.trend) {
    case 'increasing': return 'fas fa-arrow-up'
    case 'decreasing': return 'fas fa-arrow-down'
    case 'stable': return 'fas fa-minus'
    default: return 'fas fa-minus'
  }
})

const trendIconClass = computed(() => {
  if (!predictionResult.value) return 'text-gray-500'
  switch (predictionResult.value.trend) {
    case 'increasing': return 'text-red-500'
    case 'decreasing': return 'text-green-500'
    case 'stable': return 'text-green-500'
    default: return 'text-gray-500'
  }
})

// 获取预测建议
const getPredictionSuggestion = () => {
  if (!predictionResult.value) return ''
  
  const { trend, confidence, predictedAmount } = predictionResult.value
  
  if (confidence < 0.5) {
    return t('prediction.lowConfidenceSuggestion')
  }
  
  switch (trend) {
    case 'increasing':
      return t('prediction.increasingSuggestion', { amount: predictedAmount.toFixed(0) })
    case 'decreasing':
      return t('prediction.decreasingSuggestion')
    case 'stable':
      return t('prediction.stableSuggestion')
    default:
      return t('prediction.generalSuggestion')
  }
}

// 更新预测
const updatePrediction = async () => {
  if (!hasEnoughData.value) {
    predictionResult.value = null
    return
  }
  
  isLoading.value = true
  
  try {
    // 转换数据格式以匹配预测算法的期望
    const expenseData = expenses.value.map(expense => {
      const category = categories.value.find(c => c.id === expense.category_id)
      return {
        amount: expense.amount,
        date: expense.expense_date,
        category: category?.name || 'other'
      }
    })
    
    const result = await generatePrediction(expenseData, {
      category: selectedCategory.value || undefined,
      predictionMonths: predictionMonths.value,
      algorithm: selectedAlgorithm.value
    })
    
    predictionResult.value = result
    updateChart()
  } catch (error) {
    console.error('预测更新失败:', error)
    predictionResult.value = null
  } finally {
    isLoading.value = false
  }
}

// 更新图表
const updateChart = () => {
  if (!chart.value || !predictionResult.value) return
  
  const data = predictionResult.value.dataPoints
  const historicalData = data.filter(d => !d.isPredicted)
  const predictedData = data.filter(d => d.isPredicted)
  
  chart.value.data = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: t('prediction.historicalData'),
        data: historicalData.map(d => ({ x: d.date, y: d.amount })),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: t('prediction.predictedData'),
        data: predictedData.map(d => ({ x: d.date, y: d.amount })),
        borderColor: '#81C784',
        backgroundColor: 'rgba(129, 199, 132, 0.2)',
        borderWidth: 3,
        borderDash: [10, 5],
        fill: false,
        tension: 0.1,
        pointBackgroundColor: '#81C784',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  }
  
  chart.value.update('none')
}

// 初始化图表
const initChart = () => {
  if (!chartCanvas.value) return
  
  chart.value = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: [],
      datasets: []
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MM-DD'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: '#666'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: '#666',
            callback: function(value: string | number) {
              return '¥' + Number(value).toFixed(0)
            }
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            color: '#333'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#4CAF50',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ¥' + context.parsed.y.toFixed(2)
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  })
}

// 监听变化
watch([selectedCategory, predictionMonths, selectedAlgorithm], updatePrediction, { deep: true })
watch(expenses, updatePrediction, { deep: true })

// 生命周期
onMounted(async () => {
  await categoryStore.fetchCategories()
  initChart()
  updatePrediction()
})

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>

<style scoped>
.trend-prediction-chart {
  @apply w-full;
}

/* 绿色主题滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
  background: #C8E6C9;
}

.slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: #C8E6C9;
}

.chart-container {
  position: relative;
  height: 320px;
}

.stat-card {
  @apply transition-all duration-200 hover:shadow-md;
}

.slider::-webkit-slider-thumb {
  @apply appearance-none w-5 h-5 bg-green-500 rounded-full cursor-pointer;
}

.slider::-moz-range-thumb {
  @apply w-5 h-5 bg-green-500 rounded-full cursor-pointer border-0;
}

.slider:focus {
  @apply outline-none;
}

.slider:focus::-webkit-slider-thumb {
  @apply ring-2 ring-green-300;
}
</style>