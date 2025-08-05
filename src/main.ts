import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores'
import { i18n } from './locales'

// 创建Vue应用实例
const app = createApp(App)
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)
app.use(i18n)

// 初始化认证状态
const authStore = useAuthStore()
authStore.initAuth()

// 挂载应用
app.mount('#app')
