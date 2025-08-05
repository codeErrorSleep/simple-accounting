<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 px-4 py-4 fixed top-0 left-0 right-0 z-40">
      <div class="flex items-center justify-between max-w-md mx-auto">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span class="text-white text-sm font-bold">记</span>
          </div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{{ pageTitle }}</h1>
        </div>
        <div class="flex items-center space-x-3">
          <!-- 用户头像或登录按钮 -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-2">
            <div class="w-9 h-9 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50">
              <span class="text-white text-sm font-bold">
                {{ userInitial }}
              </span>
            </div>
          </div>
          <router-link
            v-else
            to="/login"
            class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            登录
          </router-link>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="pt-20 pb-24 px-4">
      <div class="max-w-md mx-auto animate-fade-in-up">
        <slot />
      </div>
    </main>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'
import BottomNavigation from './BottomNavigation.vue'

const route = useRoute()
const authStore = useAuthStore()

// 页面标题映射
const pageTitles: Record<string, string> = {
  '/': '记个大概',
  '/record': '记账',
  '/statistics': '统计',
  '/budget': '预算',
  '/settings': '设置',
  '/login': '登录'
}

const pageTitle = computed(() => {
  return pageTitles[route.path] || '记个大概'
})

const userInitial = computed(() => {
  if (authStore.user?.email) {
    return authStore.user.email.charAt(0).toUpperCase()
  }
  return 'U'
})
</script>