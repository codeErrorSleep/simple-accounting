<template>
  <div class="space-y-4">
    <!-- 支出统计卡片 -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div class="text-2xl mb-1">📅</div>
        <div class="text-xs text-gray-500 mb-1">今日</div>
        <div class="text-lg font-bold text-gray-900">¥{{ formatAmount(expenseStore.todayTotal) }}</div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div class="text-2xl mb-1">📊</div>
        <div class="text-xs text-gray-500 mb-1">本周</div>
        <div class="text-lg font-bold text-green-600">¥{{ formatAmount(expenseStore.weekTotal) }}</div>
      </div>
      
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
        <div class="text-2xl mb-1">📈</div>
        <div class="text-xs text-gray-500 mb-1">本月</div>
        <div class="text-lg font-bold text-blue-600">¥{{ formatAmount(expenseStore.monthTotal) }}</div>
      </div>
    </div>
    
    <!-- 最近记录 -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-900">最近记录</h3>
        <router-link
          to="/statistics"
          class="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          查看全部
        </router-link>
      </div>
      
      <div v-if="expenseStore.loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse">
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
      
      <div v-else-if="recentExpenses.length === 0" class="text-center py-8">
        <div class="text-4xl mb-2">💰</div>
        <p class="text-gray-500 text-sm">还没有支出记录</p>
        <p class="text-gray-400 text-xs mt-1">开始记录您的第一笔支出吧</p>
      </div>
      
      <div v-else class="space-y-3">
        <div
          v-for="expense in recentExpenses"
          :key="expense.id"
          class="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
                 :style="{ backgroundColor: getCategoryColor(expense.category_id) + '20' }">
              <span class="text-lg">{{ getCategoryIcon(expense.category_id) }}</span>
            </div>
            <div>
              <div class="font-medium text-gray-900 text-sm">
                {{ expense.description || getCategoryName(expense.category_id) }}
              </div>
              <div class="text-xs text-gray-500 flex items-center space-x-2">
                <span>{{ formatDate(expense.expense_date) }}</span>
                <span v-if="expense.source === 'voice'" class="inline-flex items-center">
                  <Mic :size="12" class="mr-1" />
                  语音
                </span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold text-gray-900">¥{{ formatAmount(expense.amount) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预算提醒 -->
    <div v-if="budgetWarning" class="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <div class="flex items-center space-x-2 mb-2">
        <AlertTriangle :size="16" class="text-orange-500" />
        <span class="font-medium text-orange-800">预算提醒</span>
      </div>
      <p class="text-sm text-orange-700">{{ budgetWarning }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Mic, AlertTriangle } from 'lucide-vue-next'
import { useExpenseStore, useCategoryStore, useBudgetStore } from '@/stores'

const expenseStore = useExpenseStore()
const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()

// 获取最近5条记录
const recentExpenses = computed(() => {
  return expenseStore.expenses.slice(0, 5)
})

// 预算警告
const budgetWarning = computed(() => {
  // 简单的预算检查逻辑
  const weeklyBudget = budgetStore.budgets.find(b => b.period_type === 'weekly')
  if (weeklyBudget && expenseStore.weekTotal > weeklyBudget.amount * 0.8) {
    return `本周支出已达预算的${Math.round((expenseStore.weekTotal / weeklyBudget.amount) * 100)}%`
  }
  
  const monthlyBudget = budgetStore.budgets.find(b => b.period_type === 'monthly')
  if (monthlyBudget && expenseStore.monthTotal > monthlyBudget.amount * 0.8) {
    return `本月支出已达预算的${Math.round((expenseStore.monthTotal / monthlyBudget.amount) * 100)}%`
  }
  
  return null
})

// 格式化金额
function formatAmount(amount: number): string {
  return amount.toFixed(2)
}

// 格式化日期
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
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

// 初始化数据
onMounted(() => {
  expenseStore.fetchExpenses()
  categoryStore.fetchCategories()
  budgetStore.fetchBudgets()
})
</script>