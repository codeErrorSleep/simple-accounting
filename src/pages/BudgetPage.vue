<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="text-center">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">预算管理</h2>
      <p class="text-gray-600 text-sm">设置和跟踪您的支出预算</p>
    </div>
    
    <!-- 预算概览 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">预算概览</h3>
        <button
          @click="showAddBudget = true"
          class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 添加预算
        </button>
      </div>
      
      <div v-if="budgetStore.loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      <div v-else-if="budgetStore.budgets.length === 0" class="text-center py-12">
        <div class="text-4xl mb-2">🎯</div>
        <p class="text-gray-500 mb-2">还没有设置预算</p>
        <p class="text-gray-400 text-sm">设置预算来更好地管理您的支出</p>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="budget in budgetStore.budgets"
          :key="budget.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center"
                   :style="{ backgroundColor: getCategoryColor(budget.category_id) + '20' }">
                <span class="text-lg">{{ getCategoryIcon(budget.category_id) }}</span>
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {{ getCategoryName(budget.category_id) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ getPeriodText(budget.period_type) }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-semibold text-gray-900">
                ¥{{ formatAmount(getCurrentSpent(budget)) }} / ¥{{ formatAmount(budget.amount) }}
              </div>
              <div class="text-sm" :class="getProgressColor(budget)">
                {{ getProgressPercentage(budget) }}%
              </div>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="getProgressBarColor(budget)"
              :style="{ width: Math.min(getProgressPercentage(budget), 100) + '%' }"
            ></div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex space-x-2">
            <button
              @click="editBudget(budget)"
              class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              编辑
            </button>
            <button
              @click="deleteBudget(budget.id)"
              class="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预算分析 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 class="font-semibold text-gray-900 mb-4">预算分析</h3>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center p-3 bg-green-50 rounded-lg">
          <div class="text-lg font-bold text-green-600">{{ budgetsOnTrack }}</div>
          <div class="text-xs text-green-500">预算正常</div>
        </div>
        <div class="text-center p-3 bg-red-50 rounded-lg">
          <div class="text-lg font-bold text-red-600">{{ budgetsOverLimit }}</div>
          <div class="text-xs text-red-500">超出预算</div>
        </div>
      </div>
      
      <!-- 建议 -->
      <div v-if="budgetSuggestions.length > 0" class="space-y-2">
        <h4 class="font-medium text-gray-900 text-sm">💡 建议</h4>
        <div
          v-for="suggestion in budgetSuggestions"
          :key="suggestion"
          class="text-sm text-gray-600 bg-yellow-50 p-2 rounded"
        >
          {{ suggestion }}
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑预算弹窗 -->
    <div v-if="showAddBudget || editingBudget" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingBudget ? '编辑预算' : '添加预算' }}
        </h3>
        
        <form @submit.prevent="saveBudget" class="space-y-4">
          <!-- 分类选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              v-model="budgetForm.category_id"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">选择分类</option>
              <option
                v-for="category in categoryStore.categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
          
          <!-- 预算金额 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预算金额</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
              <input
                v-model="budgetForm.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <!-- 周期类型 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">预算周期</label>
            <select
              v-model="budgetForm.period_type"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="yearly">每年</option>
            </select>
          </div>
          
          <!-- 开始日期 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
            <input
              v-model="budgetForm.start_date"
              type="date"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div class="flex space-x-3 pt-2">
            <button
              type="button"
              @click="cancelBudget"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="savingBudget"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {{ savingBudget ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useBudgetStore, useCategoryStore, useExpenseStore } from '@/stores'
import { toast } from 'vue-sonner'
import type { Budget } from '@/lib/supabase'

const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const expenseStore = useExpenseStore()

// 状态
const showAddBudget = ref(false)
const editingBudget = ref<Budget | null>(null)
const savingBudget = ref(false)

// 预算表单
const budgetForm = reactive({
  category_id: '',
  amount: '',
  period_type: 'monthly',
  start_date: new Date().toISOString().split('T')[0]
})

// 预算分析
const budgetsOnTrack = computed(() => {
  return budgetStore.budgets.filter(budget => getProgressPercentage(budget) <= 80).length
})

const budgetsOverLimit = computed(() => {
  return budgetStore.budgets.filter(budget => getProgressPercentage(budget) > 100).length
})

const budgetSuggestions = computed(() => {
  const suggestions: string[] = []
  
  budgetStore.budgets.forEach(budget => {
    const progress = getProgressPercentage(budget)
    const categoryName = getCategoryName(budget.category_id)
    
    if (progress > 100) {
      suggestions.push(`${categoryName}预算已超支${(progress - 100).toFixed(0)}%，建议减少此类支出`)
    } else if (progress > 80) {
      suggestions.push(`${categoryName}预算使用已达${progress.toFixed(0)}%，请注意控制支出`)
    }
  })
  
  return suggestions
})

// 格式化金额
function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

// 获取周期文本
function getPeriodText(periodType: string): string {
  const map: Record<string, string> = {
    weekly: '每周预算',
    monthly: '每月预算',
    yearly: '每年预算'
  }
  return map[periodType] || periodType
}

// 获取当前已花费金额
function getCurrentSpent(budget: Budget): number {
  const now = new Date()
  const startDate = new Date(budget.start_date)
  
  // 计算当前周期的开始和结束日期
  let periodStart: Date
  let periodEnd: Date
  
  switch (budget.period_type) {
    case 'weekly':
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const weeksSinceStart = Math.floor(daysSinceStart / 7)
      periodStart = new Date(startDate)
      periodStart.setDate(startDate.getDate() + weeksSinceStart * 7)
      periodEnd = new Date(periodStart)
      periodEnd.setDate(periodStart.getDate() + 7)
      break
      
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      break
      
    case 'yearly':
      periodStart = new Date(now.getFullYear(), 0, 1)
      periodEnd = new Date(now.getFullYear() + 1, 0, 1)
      break
      
    default:
      return 0
  }
  
  // 计算该分类在当前周期的支出
  return expenseStore.expenses
    .filter(expense => {
      const expenseDate = new Date(expense.expense_date)
      return expense.category_id === budget.category_id &&
             expenseDate >= periodStart &&
             expenseDate < periodEnd
    })
    .reduce((sum, expense) => sum + expense.amount, 0)
}

// 获取进度百分比
function getProgressPercentage(budget: Budget): number {
  const spent = getCurrentSpent(budget)
  return budget.amount > 0 ? (spent / budget.amount) * 100 : 0
}

// 获取进度颜色
function getProgressColor(budget: Budget): string {
  const progress = getProgressPercentage(budget)
  if (progress > 100) return 'text-red-600'
  if (progress > 80) return 'text-orange-600'
  return 'text-green-600'
}

// 获取进度条颜色
function getProgressBarColor(budget: Budget): string {
  const progress = getProgressPercentage(budget)
  if (progress > 100) return 'bg-red-500'
  if (progress > 80) return 'bg-orange-500'
  return 'bg-green-500'
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

// 编辑预算
function editBudget(budget: Budget) {
  editingBudget.value = budget
  budgetForm.category_id = budget.category_id
  budgetForm.amount = budget.amount.toString()
  budgetForm.period_type = budget.period_type
  budgetForm.start_date = budget.start_date
}

// 保存预算
async function saveBudget() {
  if (!budgetForm.category_id || !budgetForm.amount) return
  
  savingBudget.value = true
  try {
    const budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'end_date'> = {
      category_id: budgetForm.category_id,
      amount: parseFloat(budgetForm.amount),
      period_type: budgetForm.period_type as 'weekly' | 'monthly' | 'yearly',
      start_date: budgetForm.start_date
    }
    
    if (editingBudget.value) {
      await budgetStore.updateBudget(editingBudget.value.id, budgetData)
      toast.success('预算更新成功！')
    } else {
      await budgetStore.addBudget(budgetData)
      toast.success('预算添加成功！')
    }
    
    cancelBudget()
  } catch (error) {
    console.error('保存预算失败:', error)
    toast.error('保存失败，请重试')
  } finally {
    savingBudget.value = false
  }
}

// 删除预算
async function deleteBudget(budgetId: string) {
  if (!confirm('确定要删除这个预算吗？')) return
  
  try {
    await budgetStore.deleteBudget(budgetId)
    toast.success('预算删除成功！')
  } catch (error) {
    console.error('删除预算失败:', error)
    toast.error('删除失败，请重试')
  }
}

// 取消编辑
function cancelBudget() {
  showAddBudget.value = false
  editingBudget.value = null
  budgetForm.category_id = ''
  budgetForm.amount = ''
  budgetForm.period_type = 'monthly'
  budgetForm.start_date = new Date().toISOString().split('T')[0]
}

// 初始化
onMounted(() => {
  budgetStore.fetchBudgets()
  categoryStore.fetchCategories()
  expenseStore.fetchExpenses()
})
</script>