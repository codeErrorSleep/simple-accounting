<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 头部 -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button @click="$router.go(-1)" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft class="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">固定支出管理</h1>
          </div>
          <button 
            @click="showAddModal = true"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus class="w-4 h-4" />
            <span>添加</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="p-4">
      <!-- 即将到期提醒 -->
      <div v-if="upcomingExpenses.length > 0" class="mb-6">
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div class="flex items-center space-x-2 mb-2">
            <AlertCircle class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 class="font-medium text-yellow-800 dark:text-yellow-200">即将到期</h3>
          </div>
          <div class="space-y-2">
            <div v-for="expense in upcomingExpenses" :key="expense.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-yellow-700 dark:text-yellow-300">{{ expense.name }}</span>
                <span class="text-xs text-yellow-600 dark:text-yellow-400">{{ formatDate(expense.next_due_date) }}</span>
              </div>
              <button 
                @click="generateExpenseRecord(expense.id)"
                class="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded"
              >
                生成记录
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 固定支出列表 -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="recurringExpenses.length === 0" class="text-center py-12">
        <Calendar class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无固定支出</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">添加房租、电费等定期支出</p>
        <button 
          @click="showAddModal = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          添加固定支出
        </button>
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="expense in recurringExpenses" 
          :key="expense.id"
          class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">{{ getCategoryIcon(expense.category_id) }}</span>
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ expense.name }}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ getCategoryName(expense.category_id) }}</p>
                  </div>
                </div>
                <div class="flex-1 text-right">
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">¥{{ expense.amount.toFixed(2) }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ expense.frequency === 'weekly' ? '每周' : '每月' }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center space-x-4">
                  <span class="text-gray-500 dark:text-gray-400">
                    下次：{{ formatDate(expense.next_due_date) }}
                  </span>
                  <span :class="expense.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{ expense.is_active ? '启用' : '禁用' }}
                  </span>
                </div>
                
                <div class="flex items-center space-x-2">
                  <button 
                    @click="editExpense(expense)"
                    class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Edit2 class="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button 
                    @click="toggleExpenseStatus(expense)"
                    class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Power class="w-4 h-4" :class="expense.is_active ? 'text-green-500' : 'text-gray-400'" />
                  </button>
                  <button 
                    @click="deleteExpense(expense.id)"
                    class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <div v-if="expense.description" class="mt-2">
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ expense.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑模态框 -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ showEditModal ? '编辑固定支出' : '添加固定支出' }}
            </h2>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <!-- 名称 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">名称</label>
              <input 
                v-model="form.name"
                type="text" 
                placeholder="如：房租、电费"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <!-- 金额 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">金额</label>
              <input 
                v-model.number="form.amount"
                type="number" 
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <!-- 分类 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类</label>
              <select 
                v-model="form.category_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">选择分类</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.icon }} {{ category.name }}
                </option>
              </select>
            </div>

            <!-- 频率 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">重复频率</label>
              <div class="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  @click="form.frequency = 'weekly'"
                  :class="[
                    'px-4 py-2 rounded-lg border text-sm font-medium',
                    form.frequency === 'weekly' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  ]"
                >
                  每周
                </button>
                <button 
                  type="button"
                  @click="form.frequency = 'monthly'"
                  :class="[
                    'px-4 py-2 rounded-lg border text-sm font-medium',
                    form.frequency === 'monthly' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  ]"
                >
                  每月
                </button>
              </div>
            </div>

            <!-- 开始日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">开始日期</label>
              <input 
                v-model="form.start_date"
                type="date" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <!-- 描述 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述（可选）</label>
              <textarea 
                v-model="form.description"
                rows="3"
                placeholder="备注信息"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              ></textarea>
            </div>

            <!-- 设置选项 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">启用状态</label>
                <button 
                  type="button"
                  @click="form.is_active = !form.is_active"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    form.is_active ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  ]"
                >
                  <span 
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      form.is_active ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></span>
                </button>
              </div>
              
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-700 dark:text-gray-300">自动生成记录</label>
                <button 
                  type="button"
                  @click="form.auto_generate = !form.auto_generate"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    form.auto_generate ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  ]"
                >
                  <span 
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      form.auto_generate ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></span>
                </button>
              </div>
            </div>

            <!-- 按钮 -->
            <div class="flex space-x-3 pt-4">
              <button 
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button 
                type="submit"
                :disabled="submitting"
                class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
              >
                {{ submitting ? '保存中...' : (showEditModal ? '更新' : '添加') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, Plus, Calendar, Edit2, Trash2, Power, X, AlertCircle
} from 'lucide-vue-next'
import { useRecurringExpenseStore } from '@/stores'
import { useCategoryStore } from '@/stores'
import type { RecurringExpense } from '@/lib/supabase'
import { toast } from 'sonner'

const router = useRouter()
const recurringExpenseStore = useRecurringExpenseStore()
const categoryStore = useCategoryStore()

// 响应式数据
const showAddModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingExpense = ref<RecurringExpense | null>(null)

// 表单数据
const form = ref({
  name: '',
  amount: 0,
  category_id: '',
  frequency: 'monthly' as 'weekly' | 'monthly',
  start_date: new Date().toISOString().split('T')[0],
  description: '',
  is_active: true,
  auto_generate: true,
  next_due_date: new Date().toISOString().split('T')[0]
})

// 计算属性
const recurringExpenses = computed(() => recurringExpenseStore.recurringExpenses)
const loading = computed(() => recurringExpenseStore.loading)
const categories = computed(() => categoryStore.categories)
const upcomingExpenses = computed(() => recurringExpenseStore.getUpcomingRecurringExpenses)

// 方法
const resetForm = () => {
  form.value = {
    name: '',
    amount: 0,
    category_id: '',
    frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    description: '',
    is_active: true,
    auto_generate: true,
    next_due_date: new Date().toISOString().split('T')[0]
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingExpense.value = null
  resetForm()
}

const editExpense = (expense: RecurringExpense) => {
  editingExpense.value = expense
  form.value = {
    name: expense.name,
    amount: expense.amount,
    category_id: expense.category_id,
    frequency: expense.frequency,
    start_date: expense.start_date,
    description: expense.description || '',
    is_active: expense.is_active,
    auto_generate: expense.auto_generate,
    next_due_date: expense.next_due_date
  }
  showEditModal.value = true
}

const submitForm = async () => {
  submitting.value = true
  
  try {
    // 设置下次到期日期为开始日期
    form.value.next_due_date = form.value.start_date
    
    if (showEditModal.value && editingExpense.value) {
      const { error } = await recurringExpenseStore.updateRecurringExpense(editingExpense.value.id, form.value)
      if (error) throw error
      toast.success('固定支出更新成功')
    } else {
      const { error } = await recurringExpenseStore.addRecurringExpense(form.value)
      if (error) throw error
      toast.success('固定支出添加成功')
    }
    
    closeModal()
  } catch (error: any) {
    toast.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const deleteExpense = async (id: string) => {
  if (!confirm('确定要删除这个固定支出吗？')) return
  
  try {
    const { error } = await recurringExpenseStore.deleteRecurringExpense(id)
    if (error) throw error
    toast.success('删除成功')
  } catch (error: any) {
    toast.error(error.message || '删除失败')
  }
}

const toggleExpenseStatus = async (expense: RecurringExpense) => {
  try {
    const { error } = await recurringExpenseStore.updateRecurringExpense(expense.id, {
      is_active: !expense.is_active
    })
    if (error) throw error
    toast.success(expense.is_active ? '已禁用' : '已启用')
  } catch (error: any) {
    toast.error(error.message || '操作失败')
  }
}

const generateExpenseRecord = async (id: string) => {
  try {
    const { error } = await recurringExpenseStore.generateRecurringExpenseRecord(id)
    if (error) throw error
    toast.success('支出记录生成成功')
  } catch (error: any) {
    toast.error(error.message || '生成失败')
  }
}

const getCategoryIcon = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.icon || '💰'
}

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || '未知分类'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    recurringExpenseStore.fetchRecurringExpenses(),
    categoryStore.fetchCategories()
  ])
})
</script>