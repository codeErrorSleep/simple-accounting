<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-white/20 px-4 py-3 z-50 shadow-2xl">
    <div class="flex justify-around items-center max-w-md mx-auto">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-110 relative"
        :class="{
          'text-white': $route.path === item.path,
          'text-gray-500 hover:text-gray-700': $route.path !== item.path
        }"
      >
        <!-- 活跃状态背景 -->
        <div 
          v-if="$route.path === item.path"
          class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg animate-pulse-soft"
        ></div>
        
        <!-- 图标和文字 -->
        <div class="relative z-10 flex flex-col items-center">
          <div class="mb-1 transform transition-transform duration-300" :class="{ 'scale-110': $route.path === item.path }">
            <component :is="item.icon" :size="22" />
          </div>
          <span class="text-xs font-bold" :class="{ 'text-white': $route.path === item.path, 'text-gray-600': $route.path !== item.path }">{{ item.label }}</span>
        </div>
        
        <!-- 悬浮效果 -->
        <div 
          v-if="$route.path !== item.path"
          class="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
        ></div>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Plus, BarChart3, Target, Settings } from 'lucide-vue-next'

const navItems = [
  {
    name: 'home',
    path: '/',
    label: '首页',
    icon: Home
  },
  {
    name: 'record',
    path: '/record',
    label: '记账',
    icon: Plus
  },
  {
    name: 'statistics',
    path: '/statistics',
    label: '统计',
    icon: BarChart3
  },
  {
    name: 'budget',
    path: '/budget',
    label: '预算',
    icon: Target
  },
  {
    name: 'settings',
    path: '/settings',
    label: '设置',
    icon: Settings
  }
]
</script>