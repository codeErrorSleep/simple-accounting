<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
    <div class="flex justify-around items-center max-w-md mx-auto">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200"
        :class="{
          'text-green-600 bg-green-50': $route.path === item.path,
          'text-gray-500 hover:text-gray-700': $route.path !== item.path
        }"
      >
        <component :is="item.icon" :size="20" class="mb-1" />
        <span class="text-xs font-medium">{{ item.label }}</span>
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