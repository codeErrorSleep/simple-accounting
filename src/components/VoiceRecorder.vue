<template>
  <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
    <div class="text-center">
      <div class="mb-6">
        <h3 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">AI 语音记账</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">说出您的支出，AI 智能识别</p>
      </div>
      
      <!-- 录音按钮区域 -->
      <div class="relative mb-8">
        <!-- 外圈动画 -->
        <div v-if="isRecording" class="absolute inset-0 flex items-center justify-center">
          <div class="w-32 h-32 rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
          <div class="absolute w-28 h-28 rounded-full border-2 border-red-400 animate-pulse"></div>
        </div>
        
        <!-- 主录音按钮 -->
        <button
          @click="toggleRecording"
          :disabled="!isSupported"
          class="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
          :class="{
            'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl': !isRecording && isSupported,
            'bg-gradient-to-br from-red-500 to-pink-600 shadow-2xl shadow-red-500/25': isRecording,
            'bg-gray-300 dark:bg-gray-600 cursor-not-allowed': !isSupported
          }"
        >
          <div class="relative z-10">
            <Mic v-if="!isRecording" :size="36" class="text-white drop-shadow-lg" />
            <Square v-else :size="28" class="text-white drop-shadow-lg" />
          </div>
          
          <!-- 内部脉冲动画 -->
          <div v-if="isRecording" class="absolute inset-2 rounded-full bg-white/20 animate-pulse"></div>
        </button>
        
        <!-- 音波可视化 -->
        <div v-if="isRecording" class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div
            v-for="i in 7"
            :key="i"
            class="w-1 bg-gradient-to-t from-red-400 to-pink-500 rounded-full animate-bounce"
            :class="`h-${waveHeights[i - 1]}`"
            :style="{ animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }"
          ></div>
        </div>
      </div>
      
      <!-- 状态文字 -->
      <div class="mb-6">
        <div v-if="!isSupported" class="flex items-center justify-center space-x-2 text-red-500">
          <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          <span class="text-sm font-medium">您的浏览器不支持语音识别</span>
        </div>
        <div v-else-if="isRecording" class="flex items-center justify-center space-x-2 text-red-500">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium animate-pulse">正在录音... 请说出您的支出内容</span>
        </div>
        <div v-else-if="isProcessing" class="flex items-center justify-center space-x-2 text-blue-500">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
          <span class="text-sm font-medium">AI 正在智能识别...</span>
        </div>
        <div v-else class="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
          <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span class="text-sm font-medium">点击按钮开始语音记账</span>
        </div>
        
        <!-- 快速测试按钮 -->
        <div v-if="!isRecording && !isProcessing && !recognitionResult" class="mt-4">
          <p class="text-xs text-gray-400 dark:text-gray-500 mb-2">或者试试这些示例：</p>
          <div class="flex flex-wrap gap-2 justify-center">
            <button
              v-for="example in quickExamples"
              :key="example.text"
              @click="simulateVoiceInput(example)"
              class="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {{ example.text }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 识别结果 -->
      <div v-if="recognitionResult" class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 text-left border border-blue-100 dark:border-gray-600 shadow-lg">
        <div class="flex items-center space-x-2 mb-4">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h4 class="font-bold text-gray-900 dark:text-white">AI 识别结果</h4>
          <div class="flex-1"></div>
          <span class="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">置信度 {{ Math.round(recognitionResult.confidence * 100) }}%</span>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-600">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">语音内容：</p>
          <p class="text-base text-gray-800 dark:text-gray-200 font-medium italic">"{{ recognitionResult.text }}"</p>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wide">金额</label>
            <div class="relative">
              <span class="absolute left-0 top-1/2 transform -translate-y-1/2 text-green-600 dark:text-green-400 font-bold text-lg">¥</span>
              <input
                v-model="recognitionResult.amount"
                type="number"
                step="0.01"
                class="w-full pl-6 text-xl font-bold text-green-600 dark:text-green-400 bg-transparent border-none outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-700 rounded-lg"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wide">分类</label>
            <select
              v-model="recognitionResult.category"
              class="w-full text-sm font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 rounded-lg text-gray-700 dark:text-gray-200"
            >
              <option v-for="category in categoryStore.categories" :key="category.id" :value="category.id" class="bg-white dark:bg-gray-800">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button
            @click="confirmExpense"
            :disabled="!recognitionResult.amount || isSubmitting"
            class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center space-x-2"
          >
            <span v-if="isSubmitting" class="flex items-center space-x-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>保存中...</span>
            </span>
            <span v-else class="flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>确认记录</span>
            </span>
          </button>
          
          <button
            @click="clearResult"
            class="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-semibold flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>重新录音</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Mic, Square } from 'lucide-vue-next'
import { useExpenseStore, useCategoryStore } from '@/stores'
import type { VoiceRecognitionResult } from '@/lib/supabase'

const expenseStore = useExpenseStore()
const categoryStore = useCategoryStore()

const isSupported = ref(false)
const isRecording = ref(false)
const isProcessing = ref(false)
const isSubmitting = ref(false)
const recognitionResult = ref<VoiceRecognitionResult | null>(null)

let recognition: any = null

// 快速测试示例数据
const quickExamples = ref([
  { text: '午餐花了35元', amount: 35, category: 'food', confidence: 0.95 },
  { text: '打车回家20块', amount: 20, category: 'transport', confidence: 0.92 },
  { text: '买咖啡15元', amount: 15, category: 'food', confidence: 0.88 },
  { text: '电影票58元', amount: 58, category: 'entertainment', confidence: 0.94 },
  { text: '超市购物128元', amount: 128, category: 'shopping', confidence: 0.91 }
])

// 音波高度动画数据
const waveHeights = ref([2, 4, 6, 8, 6, 4, 2])

// 检查浏览器支持
onMounted(() => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    isSupported.value = true
    initSpeechRecognition()
  }
  
  // 加载分类数据
  categoryStore.fetchCategories()
})

// 初始化语音识别
function initSpeechRecognition() {
  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  recognition = new SpeechRecognitionAPI()
  
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'zh-CN'
  
  recognition.onstart = () => {
    isRecording.value = true
  }
  
  recognition.onend = () => {
    isRecording.value = false
  }
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    isProcessing.value = true
    
    // 模拟AI分析过程
    setTimeout(() => {
      analyzeVoiceInput(transcript)
      isProcessing.value = false
    }, 1000)
  }
  
  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error)
    isRecording.value = false
    isProcessing.value = false
  }
}

// 切换录音状态
function toggleRecording() {
  if (!recognition) return
  
  if (isRecording.value) {
    recognition.stop()
  } else {
    clearResult()
    recognition.start()
  }
}

// 分析语音输入（简单的关键词匹配）
function analyzeVoiceInput(text: string) {
  // 提取金额
  const amountMatch = text.match(/(\d+(?:\.\d+)?)(?:元|块|毛|角|分)?/)
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
  
  // 简单的分类匹配
  const categoryKeywords = {
    '餐饮': ['吃', '饭', '餐', '喝', '咖啡', '奶茶', '外卖', '食物', '午餐', '晚餐', '早餐'],
    '交通': ['打车', '地铁', '公交', '出租车', '滴滴', '车费', '油费'],
    '购物': ['买', '购', '商场', '超市', '淘宝', '京东', '衣服', '鞋子'],
    '娱乐': ['电影', '游戏', '唱歌', 'KTV', '娱乐', '玩'],
    '医疗': ['医院', '药', '看病', '体检', '医疗'],
    '教育': ['书', '课程', '培训', '学习', '教育']
  }
  
  let matchedCategory = '其他'
  let confidence = 0.85 // 基础置信度
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      matchedCategory = category
      confidence = 0.92
      break
    }
  }
  
  // 如果找到金额，提高置信度
  if (amount > 0) {
    confidence = Math.min(confidence + 0.05, 0.98)
  }
  
  // 找到对应的分类ID
  const category = categoryStore.categories.find(c => c.name === matchedCategory)
  
  recognitionResult.value = {
    text,
    amount,
    category: category?.id || categoryStore.categories[0]?.id || '',
    confidence: Math.round(confidence * 100) / 100
  }
}

// 模拟语音输入（用于测试）
function simulateVoiceInput(example: any) {
  isProcessing.value = true
  
  // 模拟AI处理时间
  setTimeout(() => {
    const category = categoryStore.categories.find(c => c.name.includes('餐饮') && example.category === 'food') ||
                   categoryStore.categories.find(c => c.name.includes('交通') && example.category === 'transport') ||
                   categoryStore.categories.find(c => c.name.includes('购物') && example.category === 'shopping') ||
                   categoryStore.categories.find(c => c.name.includes('娱乐') && example.category === 'entertainment') ||
                   categoryStore.categories[0]
    
    recognitionResult.value = {
      text: example.text,
      amount: example.amount,
      category: category?.id || '',
      confidence: example.confidence
    }
    isProcessing.value = false
  }, Math.random() * 800 + 1200) // 1.2-2秒随机延迟
}

// 确认支出记录
async function confirmExpense() {
  if (!recognitionResult.value || !recognitionResult.value.amount) return
  
  isSubmitting.value = true
  
  try {
    await expenseStore.addExpense({
      amount: recognitionResult.value.amount,
      category_id: recognitionResult.value.category,
      description: recognitionResult.value.text,
      expense_date: new Date().toISOString().split('T')[0],
      source: 'voice'
    })
    
    clearResult()
    // 可以添加成功提示
  } catch (error) {
    console.error('保存支出记录失败:', error)
    // 可以添加错误提示
  } finally {
    isSubmitting.value = false
  }
}

// 清除识别结果
function clearResult() {
  recognitionResult.value = null
}

// 语音识别类型已在 @/types/speech.d.ts 中定义
</script>