<template>
  <div class="space-y-4">
    <!-- 页面标题 -->
    <div class="text-center">
      <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ $t('record.title') }}</h2>
      <p class="text-gray-600 text-xs">{{ $t('record.subtitle') }}</p>
    </div>
    
    <!-- 记账表单 -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 金额输入 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('record.amount') }}</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">¥</span>
          <input
            v-model="form.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full pl-8 pr-4 py-4 text-2xl font-semibold text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <!-- 分类选择 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('record.category') }}</label>
        <div v-if="categoryStore.loading" class="grid grid-cols-3 gap-3">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div v-else class="grid grid-cols-3 gap-3">
          <button
            v-for="category in categoryStore.categories"
            :key="category.id"
            type="button"
            @click="selectCategory(category.id)"
            class="flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all"
            :class="{
              'border-green-500 bg-green-50': form.category_id === category.id,
              'border-gray-200 hover:border-gray-300': form.category_id !== category.id
            }"
          >
            <span class="text-2xl mb-1">{{ category.icon }}</span>
            <span class="text-xs font-medium text-gray-700">{{ category.name }}</span>
          </button>
        </div>
        
        <!-- 添加新分类按钮 -->
        <button
          type="button"
          @click="showAddCategory = true"
          class="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + {{ $t('record.addNewCategory') }}
        </button>
      </div>
      
      <!-- 描述输入 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('record.description') }}</label>
        <input
          v-model="form.description"
          type="text"
          :placeholder="$t('record.descriptionPlaceholder')"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      <!-- 日期选择 -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('record.date') }}</label>
        <input
          v-model="form.expense_date"
          type="date"
          class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>
      
      <!-- 提交按钮 -->
      <div class="space-y-2">
        <button
          type="submit"
          :disabled="!isFormValid || submitting"
          class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
        >
          <span v-if="submitting" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ $t('record.saving') }}
          </span>
          <span v-else>{{ $t('record.saveRecord') }}</span>
        </button>
        
        <button
          type="button"
          @click="resetForm"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
        >
          {{ $t('record.resetForm') }}
        </button>
      </div>
    </form>
    
    <!-- 添加分类弹窗 -->
    <div v-if="showAddCategory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-4">{{ $t('record.addNewCategory') }}</h3>
        <form @submit.prevent="addCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('record.categoryName') }}</label>
            <input
              v-model="newCategory.name"
              type="text"
              :placeholder="$t('record.categoryNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('record.icon') }}</label>
            <input
              v-model="newCategory.icon"
              type="text"
              placeholder="🚗"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('record.color') }}</label>
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
              {{ addingCategory ? $t('record.adding') : $t('common.add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExpenseStore, useCategoryStore } from '@/stores'
import { toast } from 'vue-sonner'

const router = useRouter()
const expenseStore = useExpenseStore()
const categoryStore = useCategoryStore()

// 表单数据
const form = reactive({
  amount: '',
  category_id: '',
  description: '',
  expense_date: new Date().toISOString().split('T')[0]
})

// 状态
const submitting = ref(false)
const showAddCategory = ref(false)
const addingCategory = ref(false)

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

// 表单验证
const isFormValid = computed(() => {
  return form.amount && parseFloat(form.amount) > 0 && form.category_id && form.expense_date
})

// 选择分类
function selectCategory(categoryId: string) {
  form.category_id = categoryId
}

// 提交表单
async function handleSubmit() {
  if (!isFormValid.value) return
  
  submitting.value = true
  try {
    await expenseStore.addExpense({
      amount: parseFloat(form.amount),
      category_id: form.category_id,
      description: form.description || null,
      expense_date: form.expense_date,
      source: 'manual'
    })
    
    toast.success('记录保存成功！')
    resetForm()
    router.push('/')
  } catch (error) {
    console.error('保存记录失败:', error)
    toast.error('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  form.amount = ''
  form.category_id = ''
  form.description = ''
  form.expense_date = new Date().toISOString().split('T')[0]
}

// 添加新分类
async function addCategory() {
  if (!newCategory.name || !newCategory.icon) return
  
  addingCategory.value = true
  try {
    const result = await categoryStore.addCategory({
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color,
      is_default: false
    })
    
    // 自动选择新添加的分类
    if (result.data) {
      form.category_id = result.data.id
    }
    
    // 重置新分类表单
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

// 初始化
onMounted(() => {
  categoryStore.fetchCategories()
})
</script>