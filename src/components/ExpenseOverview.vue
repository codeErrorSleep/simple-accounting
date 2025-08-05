<template>
  <div class="space-y-4">
    <!-- 支出统计卡片 -->
    <div class="grid grid-cols-3 gap-4 animate-fade-in-up">
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 text-center transform hover:scale-105 transition-all duration-300">
        <div class="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span class="text-white text-lg font-bold">今</span>
        </div>
        <div class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">今日</div>
        <div class="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">¥{{ formatAmount(expenseStore.todayTotal) }}</div>
      </div>
      
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 text-center transform hover:scale-105 transition-all duration-300">
        <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span class="text-white text-lg font-bold">周</span>
        </div>
        <div class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">本周</div>
        <div class="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">¥{{ formatAmount(expenseStore.weekTotal) }}</div>
      </div>
      
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 text-center transform hover:scale-105 transition-all duration-300">
        <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span class="text-white text-lg font-bold">月</span>
        </div>
        <div class="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">本月</div>
        <div class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">¥{{ formatAmount(expenseStore.monthTotal) }}</div>
      </div>
    </div>
    
    <!-- 最近记录 -->
    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-slide-in-right">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-bold text-gray-900 flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-sm font-bold">📝</span>
          </div>
          <span class="text-lg">最近记录</span>
        </h3>
        <router-link
          to="/statistics"
          class="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 font-bold transition-all duration-300"
        >
          查看全部 →
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
      
      <div v-else-if="recentExpenses.length === 0" class="text-center py-12">
        <div class="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">💰</span>
        </div>
        <p class="text-gray-600 text-base font-medium mb-2">还没有支出记录</p>
        <p class="text-gray-400 text-sm">开始记录您的第一笔支出吧 ✨</p>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="expense in recentExpenses"
          :key="expense.id"
          class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                 :style="{ background: `linear-gradient(135deg, ${getCategoryColor(expense.category_id)}20, ${getCategoryColor(expense.category_id)}40)` }">
              <span class="text-xl">{{ getCategoryIcon(expense.category_id) }}</span>
            </div>
            <div>
              <div class="font-bold text-gray-900 text-sm">
                {{ expense.description || getCategoryName(expense.category_id) }}
              </div>
              <div class="text-xs text-gray-500 flex items-center space-x-3 mt-1">
                <span class="font-medium">{{ formatDate(expense.expense_date) }}</span>
                <span v-if="expense.source === 'voice'" class="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <Mic :size="10" class="mr-1" />
                  <span class="text-xs font-semibold">语音</span>
                </span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-bold text-lg bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">¥{{ formatAmount(expense.amount) }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预算提醒 -->
    <div v-if="budgetWarning" class="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 shadow-lg animate-pulse-soft">
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
          <AlertTriangle :size="16" class="text-white" />
        </div>
        <span class="font-bold text-orange-800 text-lg">预算提醒</span>
      </div>
      <p class="text-sm text-orange-700 font-medium leading-relaxed">{{ budgetWarning }}</p>
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