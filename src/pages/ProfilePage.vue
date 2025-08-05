<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="text-center">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">我的</h2>
      <p class="text-gray-600 dark:text-gray-300 text-xs">个人中心</p>
    </div>
    
    <!-- 用户信息 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-4">用户信息</h3>
      
      <div v-if="!authStore.isAuthenticated" class="text-center py-8">
        <div class="text-4xl mb-2">👤</div>
        <p class="text-gray-500 dark:text-gray-400 mb-4">请先登录以查看用户信息</p>
        <router-link
          to="/login"
          class="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          立即登录
        </router-link>
      </div>
      
      <div v-else class="space-y-4">
        <div class="flex items-center space-x-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <User :size="24" class="text-green-600" />
          </div>
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ authStore.user?.email || '用户' }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">记个大概用户</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 pt-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-lg font-bold text-blue-600">{{ totalExpenses }}</div>
            <div class="text-xs text-blue-500">总记录数</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-lg font-bold text-green-600">{{ daysSinceJoin }}</div>
            <div class="text-xs text-green-500">使用天数</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快捷功能 -->
    <div class="space-y-3">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">快捷功能</h3>
      
      <div class="space-y-3">
        <router-link
          to="/settings"
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span class="text-white text-lg">⚙️</span>
            </div>
            <span class="font-medium text-gray-900 dark:text-white">应用设置</span>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </router-link>
        
        <router-link
          to="/recurring-expenses"
          class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span class="text-white text-lg">🔄</span>
            </div>
            <span class="font-medium text-gray-900 dark:text-white">固定支出</span>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </router-link>
      </div>
    </div>
    
    <!-- 关于应用 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">关于应用</h3>
      
      <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <div class="flex justify-between">
          <span>应用版本</span>
          <span>1.0.0</span>
        </div>
        <div class="flex justify-between">
          <span>开发者</span>
          <span>邱少</span>
        </div>
      </div>
      
      <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          © 2025 记个大概. 保留所有权利.
        </p>
      </div>
    </div>
    
    <!-- 退出登录 -->
    <div v-if="authStore.isAuthenticated" class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <button
        @click="logout"
        class="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg transition-colors"
      >
        <LogOut :size="18" />
        <span>退出登录</span>
      </button>
    </div>
    

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, LogOut } from 'lucide-vue-next'
import { useAuthStore, useExpenseStore } from '@/stores'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()
const expenseStore = useExpenseStore()

// 统计数据
const totalExpenses = computed(() => expenseStore.expenses.length)

const daysSinceJoin = computed(() => {
  if (!authStore.user?.created_at) return 0
  const joinDate = new Date(authStore.user.created_at)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - joinDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 退出登录
async function logout() {
  try {
    await authStore.logout()
    toast.success('已退出登录')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    toast.error('退出失败，请重试')
  }
}

// 初始化
onMounted(() => {
  expenseStore.fetchExpenses()
})
</script>