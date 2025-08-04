<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-40">
      <div class="flex items-center justify-between max-w-md mx-auto">
        <h1 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h1>
        <div class="flex items-center space-x-2">
          <!-- 用户头像或登录按钮 -->
          <div v-if="authStore.isAuthenticated" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ userInitial }}
              </span>
            </div>
          </div>
          <router-link
            v-else
            to="/login"
            class="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            登录
          </router-link>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="pt-16 pb-20 px-4">
      <div class="max-w-md mx-auto">
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