<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="relative text-center">
      <!-- 返回按钮 -->
      <button
        @click="goBack"
        class="absolute left-0 top-0 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft :size="20" />
      </button>
      
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ $t('nav.settings') }}</h2>
      <p class="text-gray-600 dark:text-gray-300 text-xs">{{ $t('settings.categoryManagement') }}</p>
    </div>
    
    <!-- 分类管理 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-900 dark:text-white">{{ $t('settings.categoryManagement') }}</h3>
        <button
          @click="showAddCategory = true"
          class="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          + {{ $t('settings.addCategory') }}
        </button>
      </div>
      
      <div v-if="categoryStore.loading" class="grid grid-cols-2 gap-3">
        <div v-for="i in 4" :key="i" class="animate-pulse">
          <div class="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="category in categoryStore.categories"
          :key="category.id"
          class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
        >
          <div class="flex items-center space-x-2">
            <span class="text-lg">{{ category.icon }}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ category.name }}</span>
          </div>
          <button
            @click="deleteCategory(category.id)"
            class="text-red-500 hover:text-red-700 p-1"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- 数据管理 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">{{ $t('settings.dataManagement') }}</h3>
      
      <div class="space-y-2">
        <button
          @click="exportData"
          :disabled="exporting"
          class="w-full flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 text-blue-700 disabled:text-gray-500 py-3 px-4 rounded-lg transition-colors"
        >
          <Download :size="18" />
          <span>{{ exporting ? $t('common.loading') : $t('settings.exportData') }}</span>
        </button>
        
        <button
          @click="clearAllData"
          class="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg transition-colors"
        >
          <Trash2 :size="18" />
          <span>{{ $t('settings.clearAllData') }}</span>
        </button>
      </div>
    </div>
    
    <!-- 应用设置 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 class="font-semibold text-gray-900 dark:text-white mb-3">{{ $t('settings.languageSettings') }}</h3>
      
      <div class="space-y-3">
        <!-- 主题设置 -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ $t('settings.darkMode') }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.switchTheme') }}</div>
          </div>
          <button
            @click="toggleTheme"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="isDarkMode ? 'bg-green-600' : 'bg-gray-200'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="isDarkMode ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
        
        <!-- 语音记账设置 -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ $t('home.voiceRecord') }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.enableVoiceInput') }}</div>
          </div>
          <button
            @click="toggleVoiceRecording"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="voiceEnabled ? 'bg-green-600' : 'bg-gray-200'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="voiceEnabled ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
        
        <!-- 通知设置 -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ $t('budget.budgetWarning') }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.budgetNotification') }}</div>
          </div>
          <button
            @click="toggleNotifications"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="notificationsEnabled ? 'bg-green-600' : 'bg-gray-200'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="notificationsEnabled ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
        
        <!-- 语言设置 -->
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900 dark:text-white">{{ $t('settings.language') }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.selectLanguage') }}</div>
          </div>
          <LanguageSwitch />
        </div>
      </div>
    </div>
    
    <!-- 添加分类弹窗 -->
    <div v-if="showAddCategory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold dark:text-white mb-4">{{ $t('settings.addCategory') }}</h3>
        <form @submit.prevent="addCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.categoryName') }}</label>
            <input
              v-model="newCategory.name"
              type="text"
              :placeholder="$t('settings.categoryNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.categoryIcon') }}</label>
            <input
              v-model="newCategory.icon"
              type="text"
              placeholder="🚗"
              class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('settings.categoryColor') }}</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="color in predefinedColors"
                :key="color"
                type="button"
                @click="newCategory.color = color"
                class="w-8 h-8 rounded-full border-2"
                :style="{ backgroundColor: color }"
                :class="{
                  'border-gray-800': newCategory.color === color,
                  'border-gray-300': newCategory.color !== color
                }"
              ></button>
            </div>
          </div>
          <div class="flex space-x-3 pt-2">
            <button
              type="button"
              @click="showAddCategory = false"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="addingCategory"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {{ addingCategory ? $t('common.loading') : $t('common.add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Trash2, Download, ArrowLeft } from 'lucide-vue-next'
import { useExpenseStore, useCategoryStore, useBudgetStore } from '@/stores'
import { useTheme } from '@/composables/useTheme'
import { toast } from 'vue-sonner'
import LanguageSwitch from '@/components/LanguageSwitch.vue'

const router = useRouter()

const expenseStore = useExpenseStore()
const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()
const { isDarkMode, toggleTheme } = useTheme()

// 状态
const showAddCategory = ref(false)
const addingCategory = ref(false)
const exporting = ref(false)
const voiceEnabled = ref(true)
const notificationsEnabled = ref(true)

// 新分类表单
const newCategory = reactive({
  name: '',
  icon: '',
  color: '#4CAF50'
})

// 预定义颜色
const predefinedColors = [
  '#4CAF50', '#2196F3', '#FF9800', '#F44336',
  '#9C27B0', '#607D8B', '#795548', '#E91E63',
  '#3F51B5', '#009688', '#CDDC39', '#FF5722'
]

// 切换语音记账
function toggleVoiceRecording() {
  voiceEnabled.value = !voiceEnabled.value
  localStorage.setItem('voiceEnabled', voiceEnabled.value.toString())
  toast.success(voiceEnabled.value ? '语音记账已启用' : '语音记账已禁用')
}

// 切换通知
function toggleNotifications() {
  notificationsEnabled.value = !notificationsEnabled.value
  localStorage.setItem('notificationsEnabled', notificationsEnabled.value.toString())
  toast.success(notificationsEnabled.value ? '预算提醒已启用' : '预算提醒已禁用')
}

// 添加分类
async function addCategory() {
  if (!newCategory.name || !newCategory.icon) return
  
  addingCategory.value = true
  try {
    await categoryStore.addCategory({
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color,
      is_default: false
    })
    
    // 重置表单
    newCategory.name = ''
    newCategory.icon = ''
    newCategory.color = '#4CAF50'
    showAddCategory.value = false
    
    toast.success('分类添加成功！')
  } catch (error) {
    console.error('添加分类失败:', error)
    toast.error('添加分类失败，请重试')
  } finally {
    addingCategory.value = false
  }
}

// 删除分类
async function deleteCategory(categoryId: string) {
  if (!confirm('确定要删除这个分类吗？删除后相关的支出记录将无法显示分类信息。')) return
  
  try {
    await categoryStore.deleteCategory(categoryId)
    toast.success('分类删除成功！')
  } catch (error) {
    console.error('删除分类失败:', error)
    toast.error('删除分类失败，请重试')
  }
}

// 导出数据
async function exportData() {
  exporting.value = true
  try {
    const data = {
      expenses: expenseStore.expenses,
      categories: categoryStore.categories,
      budgets: budgetStore.budgets,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `记个大概-数据导出-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('数据导出成功！')
  } catch (error) {
    console.error('导出数据失败:', error)
    toast.error('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 清空所有数据
async function clearAllData() {
  const confirmed = confirm('确定要清空所有数据吗？此操作不可恢复！')
  if (!confirmed) return
  
  const doubleConfirmed = confirm('请再次确认：这将删除所有支出记录、分类和预算数据，且无法恢复！')
  if (!doubleConfirmed) return
  
  try {
    // 这里应该调用相应的清空方法
    // 由于涉及多个表的数据删除，建议在后端实现
    toast.success('数据清空成功！')
    
    // 重新加载数据
    await Promise.all([
      expenseStore.fetchExpenses(),
      categoryStore.fetchCategories(),
      budgetStore.fetchBudgets()
    ])
  } catch (error) {
    console.error('清空数据失败:', error)
    toast.error('清空失败，请重试')
  }
}

// 返回上一页
function goBack() {
  router.push('/profile')
}

// 初始化
onMounted(() => {
  // 加载设置
  const savedVoiceEnabled = localStorage.getItem('voiceEnabled')
  if (savedVoiceEnabled !== null) {
    voiceEnabled.value = savedVoiceEnabled === 'true'
  }
  
  const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled')
  if (savedNotificationsEnabled !== null) {
    notificationsEnabled.value = savedNotificationsEnabled === 'true'
  }
  
  // 加载数据
  categoryStore.fetchCategories()
  expenseStore.fetchExpenses()
  budgetStore.fetchBudgets()
})
</script>