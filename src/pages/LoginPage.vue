<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div class="text-4xl mb-4">💰</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">记个大概</h1>
        <p class="text-gray-600">简单记账，轻松管理您的支出</p>
      </div>
      
      <!-- 登录表单 -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="mb-6">
          <div class="flex border-b border-gray-200">
            <button
              @click="activeTab = 'login'"
              class="flex-1 py-3 text-center font-medium transition-colors"
              :class="{
                'text-green-600 border-b-2 border-green-600': activeTab === 'login',
                'text-gray-500 hover:text-gray-700': activeTab !== 'login'
              }"
            >
              登录
            </button>
            <button
              @click="activeTab = 'register'"
              class="flex-1 py-3 text-center font-medium transition-colors"
              :class="{
                'text-green-600 border-b-2 border-green-600': activeTab === 'register',
                'text-gray-500 hover:text-gray-700': activeTab !== 'register'
              }"
            >
              注册
            </button>
          </div>
        </div>
        
        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              v-model="loginForm.email"
              type="email"
              placeholder="请输入您的邮箱"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入您的密码"
                class="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!showPassword" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span class="ml-2 text-sm text-gray-600">记住我</span>
            </label>
            <button
              type="button"
              class="text-sm text-green-600 hover:text-green-700"
            >
              忘记密码？
            </button>
          </div>
          
          <button
            type="submit"
            :disabled="loginLoading"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            <span v-if="loginLoading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              登录中...
            </span>
            <span v-else>登录</span>
          </button>
        </form>
        
        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              v-model="registerForm.email"
              type="email"
              placeholder="请输入您的邮箱"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div class="relative">
              <input
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请设置密码（至少6位）"
                class="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                minlength="6"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Eye v-if="!showPassword" :size="20" />
                <EyeOff v-else :size="20" />
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
            <input
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          
          <div class="flex items-center">
            <input
              v-model="registerForm.agreeTerms"
              type="checkbox"
              class="rounded border-gray-300 text-green-600 focus:ring-green-500"
              required
            />
            <span class="ml-2 text-sm text-gray-600">
              我同意
              <button type="button" class="text-green-600 hover:text-green-700">用户协议</button>
              和
              <button type="button" class="text-green-600 hover:text-green-700">隐私政策</button>
            </span>
          </div>
          
          <button
            type="submit"
            :disabled="registerLoading || !isRegisterFormValid"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
          >
            <span v-if="registerLoading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              注册中...
            </span>
            <span v-else>注册</span>
          </button>
        </form>
        
        <!-- 分隔线 -->
        <div class="my-6 flex items-center">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="px-4 text-sm text-gray-500">或</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>
        
        <!-- 游客模式 -->
        <div class="space-y-3">
          <button
            @click="handleGuestLogin"
            class="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
          >
            <User :size="20" />
            <span>游客模式体验</span>
          </button>
        </div>
      </div>
      
      <!-- 底部信息 -->
      <div class="text-center mt-6 text-sm text-gray-500">
        <p>© 2024 记个大概. 保留所有权利.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, User } from 'lucide-vue-next'
import { useAuthStore } from '@/stores'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

// 状态
const activeTab = ref<'login' | 'register'>('login')
const showPassword = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 注册表单
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 注册表单验证
const isRegisterFormValid = computed(() => {
  return registerForm.email &&
         registerForm.password &&
         registerForm.password.length >= 6 &&
         registerForm.password === registerForm.confirmPassword &&
         registerForm.agreeTerms
})

// 处理登录
async function handleLogin() {
  if (!loginForm.email || !loginForm.password) {
    toast.error('请填写完整的登录信息')
    return
  }
  
  loginLoading.value = true
  try {
    await authStore.signIn(loginForm.email, loginForm.password)
    toast.success('登录成功！')
    router.push('/')
  } catch (error: any) {
    console.error('登录失败:', error)
    toast.error(error.message || '登录失败，请检查邮箱和密码')
  } finally {
    loginLoading.value = false
  }
}

// 处理注册
async function handleRegister() {
  if (!isRegisterFormValid.value) {
    toast.error('请填写完整的注册信息')
    return
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    toast.error('两次输入的密码不一致')
    return
  }
  
  registerLoading.value = true
  try {
    await authStore.signUp(registerForm.email, registerForm.password)
    toast.success('注册成功！正在为您登录...')
    // 注册成功后自动跳转到首页
    router.push('/')
  } catch (error: any) {
    console.error('注册失败:', error)
    toast.error(error.message || '注册失败，该邮箱可能已被注册')
  } finally {
    registerLoading.value = false
  }
}

// Google 登录
async function handleGoogleLogin() {
  try {
    await authStore.loginWithGoogle()
    toast.success('登录成功！')
    router.push('/')
  } catch (error: any) {
    console.error('Google登录失败:', error)
    toast.error(error.message || 'Google登录失败，请重试')
  }
}

// 游客模式
function handleGuestLogin() {
  authStore.loginAsGuest()
  router.push('/')
}
</script>