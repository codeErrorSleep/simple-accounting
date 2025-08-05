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
    <div v-if="!authStore.isAuthenticated" class="text-center py-8 animate-fade-in-up">
      <div class="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span class="text-white text-2xl font-bold">记</span>
        </div>
        <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">欢迎使用记个大概</h2>
        <p class="text-gray-600 text-base mb-6 leading-relaxed">AI 智能记账，让财务管理变得简单有趣</p>
        <router-link
          to="/login"
          class="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          立即开始 ✨
        </router-link>
      </div>
    </div>
    
    <!-- 已登录用户的主要功能 -->
    <div v-else class="space-y-6">
      <!-- 语音记账组件 -->
      <VoiceRecorder />
      
      <!-- 支出概览组件 -->
      <ExpenseOverview />
      
      <!-- 固定支出提醒 -->
      <div v-if="todayDue.length > 0 || upcomingDue.length > 0" class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-slide-in-right">
        <h3 class="font-bold text-gray-900 mb-4 flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Clock :size="16" class="text-white" />
          </div>
          <span class="text-lg">固定支出提醒</span>
        </h3>
        
        <!-- 今日到期 -->
        <div v-if="todayDue.length > 0" class="mb-6">
          <h4 class="text-sm font-bold text-red-600 mb-3 flex items-center space-x-2">
            <div class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle :size="12" class="text-white" />
            </div>
            <span>今日到期</span>
          </h4>
          <div class="space-y-3">
            <div
              v-for="expense in todayDue"
              :key="expense.id"
              class="flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100 shadow-sm"
            >
              <div>
                <div class="font-bold text-red-800">{{ expense.name }}</div>
                <div class="text-sm text-red-600 font-medium">¥{{ expense.amount }}</div>
              </div>
              <button
                @click="generateExpenseRecord(expense)"
                class="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                记录支出
              </button>
            </div>
          </div>
        </div>
        
        <!-- 即将到期 -->
        <div v-if="upcomingDue.length > 0">
          <h4 class="text-sm font-bold text-orange-600 mb-3 flex items-center space-x-2">
            <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <Clock :size="12" class="text-white" />
            </div>
            <span>即将到期</span>
          </h4>
          <div class="space-y-3">
            <div
              v-for="expense in upcomingDue"
              :key="expense.id"
              class="flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-100 shadow-sm"
            >
              <div>
                <div class="font-bold text-orange-800">{{ expense.name }}</div>
                <div class="text-sm text-orange-600 font-medium">
                  ¥{{ expense.amount }} · {{ new Date(expense.next_due_date).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-gray-200">
          <router-link
            to="/recurring-expenses"
            class="text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 font-bold transition-all duration-300"
          >
            管理所有固定支出 →
          </router-link>
        </div>
      </div>
      
      <!-- 快速操作 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-slide-in-right">
        <h3 class="font-bold text-gray-900 mb-4 flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <span class="text-white text-sm font-bold">⚡</span>
          </div>
          <span class="text-lg">快速操作</span>
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <router-link
            to="/record"
            class="flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-green-100"
          >
            <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus :size="20" class="text-white" />
            </div>
            <span class="font-bold text-sm">手动记账</span>
          </router-link>
          
          <router-link
            to="/budget"
            class="flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 py-4 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg border border-blue-100"
          >
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target :size="20" class="text-white" />
            </div>
            <span class="font-bold text-sm">设置预算</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
