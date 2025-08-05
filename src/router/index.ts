import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import HomePage from '@/pages/HomePage.vue'
import RecordPage from '@/pages/RecordPage.vue'
import StatisticsPage from '@/pages/StatisticsPage.vue'
import BudgetPage from '@/pages/BudgetPage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RecurringExpensePage from '@/pages/RecurringExpensePage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/record',
    name: 'record',
    component: RecordPage,
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: StatisticsPage,
  },
  {
    path: '/budget',
    name: 'budget',
    component: BudgetPage,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage,
  },
  {
    path: '/recurring-expenses',
    name: 'recurring-expenses',
    component: RecurringExpensePage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态
  if (!authStore.user) {
    // 检查是否是游客模式
    if (localStorage.getItem('isGuestMode') === 'true') {
      authStore.loginAsGuest()
    } else {
      await authStore.initAuth()
    }
  }
  
  // 需要认证的路由
  const requiresAuth = ['home', 'record', 'statistics', 'budget', 'profile', 'settings', 'recurring-expenses']
  
  if (requiresAuth.includes(to.name as string)) {
    if (!authStore.user) {
      // 未登录，重定向到登录页
      next({ name: 'login' })
      return
    }
  }
  
  // 已登录用户访问登录页，重定向到首页
  if (to.name === 'login' && authStore.user) {
    next({ name: 'home' })
    return
  }
  
  next()
})

export default router
