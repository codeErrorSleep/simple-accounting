<script setup lang="ts">
import { Plus, Target, Clock, AlertCircle } from 'lucide-vue-next'
import { useAuthStore, useRecurringExpenseStore } from '@/stores'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import ExpenseOverview from '@/components/ExpenseOverview.vue'
import { computed, onMounted } from 'vue'

const authStore = useAuthStore()
const recurringExpenseStore = useRecurringExpenseStore()

// 获取今日到期和即将到期的固定支出
const todayDue = computed(() => recurringExpenseStore.getTodayDueRecurringExpenses)
const upcomingDue = computed(() => recurringExpenseStore.getUpcomingRecurringExpenses.slice(0, 3)) // 只显示前3个

// 生成固定支出记录
const generateExpenseRecord = async (recurringExpense: any) => {
  try {
    await recurringExpenseStore.generateRecurringExpenseRecord(recurringExpense.id)
  } catch (error) {
    console.error('生成支出记录失败:', error)
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    recurringExpenseStore.fetchRecurringExpenses()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- 欢迎信息 -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-4">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">欢迎使用记个大概</h2>
      <p class="text-gray-600 text-sm mb-4">简单记账，轻松管理您的支出</p>
      <router-link
        to="/login"
        class="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        立即开始
      </router-link>
    </div>
    
    <!-- 已登录用户的主要功能 -->
    <div v-else class="space-y-6">
      <!-- 语音记账组件 -->
      <VoiceRecorder />
      
      <!-- 支出概览组件 -->
      <ExpenseOverview />
      
      <!-- 固定支出提醒 -->
      <div v-if="todayDue.length > 0 || upcomingDue.length > 0" class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Clock :size="18" class="text-blue-600" />
          <span>固定支出提醒</span>
        </h3>
        
        <!-- 今日到期 -->
        <div v-if="todayDue.length > 0" class="mb-4">
          <h4 class="text-sm font-medium text-red-600 mb-2 flex items-center space-x-1">
            <AlertCircle :size="14" />
            <span>今日到期</span>
          </h4>
          <div class="space-y-2">
            <div
              v-for="expense in todayDue"
              :key="expense.id"
              class="flex items-center justify-between bg-red-50 p-3 rounded-lg"
            >
              <div>
                <div class="font-medium text-red-800">{{ expense.name }}</div>
                <div class="text-sm text-red-600">¥{{ expense.amount }}</div>
              </div>
              <button
                @click="generateExpenseRecord(expense)"
                class="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
              >
                记录支出
              </button>
            </div>
          </div>
        </div>
        
        <!-- 即将到期 -->
        <div v-if="upcomingDue.length > 0">
          <h4 class="text-sm font-medium text-orange-600 mb-2">即将到期</h4>
          <div class="space-y-2">
            <div
              v-for="expense in upcomingDue"
              :key="expense.id"
              class="flex items-center justify-between bg-orange-50 p-3 rounded-lg"
            >
              <div>
                <div class="font-medium text-orange-800">{{ expense.name }}</div>
                <div class="text-sm text-orange-600">
                  ¥{{ expense.amount }} · {{ new Date(expense.next_due_date).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-3 pt-3 border-t border-gray-100">
          <router-link
            to="/recurring-expenses"
            class="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            管理所有固定支出 →
          </router-link>
        </div>
      </div>
      
      <!-- 快速操作 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 class="font-semibold text-gray-900 mb-3">快速操作</h3>
        <div class="grid grid-cols-2 gap-3">
          <router-link
            to="/record"
            class="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg transition-colors"
          >
            <Plus :size="18" />
            <span class="font-medium">手动记账</span>
          </router-link>
          
          <router-link
            to="/budget"
            class="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg transition-colors"
          >
            <Target :size="18" />
            <span class="font-medium">设置预算</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
