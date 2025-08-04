<template>
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div class="text-center">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">语音记账</h3>
      
      <!-- 录音按钮 -->
      <div class="relative mb-6">
        <button
          @click="toggleRecording"
          :disabled="!isSupported"
          class="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform"
          :class="{
            'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 scale-105 shadow-lg': !isRecording,
            'bg-gradient-to-br from-red-400 to-red-600 animate-pulse': isRecording,
            'bg-gray-300 cursor-not-allowed': !isSupported
          }"
        >
          <Mic v-if="!isRecording" :size="32" class="text-white" />
          <Square v-else :size="24" class="text-white" />
        </button>
        
        <!-- 录音波形动画 -->
        <div v-if="isRecording" class="absolute inset-0 flex items-center justify-center">
          <div class="flex space-x-1">
            <div
              v-for="i in 5"
              :key="i"
              class="w-1 bg-white rounded-full animate-pulse"
              :class="`h-${Math.floor(Math.random() * 8) + 4}`"
              :style="{ animationDelay: `${i * 0.1}s` }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 状态文字 -->
      <p class="text-sm text-gray-600 mb-4">
        <span v-if="!isSupported" class="text-red-500">
          您的浏览器不支持语音识别
        </span>
        <span v-else-if="isRecording" class="text-red-500">
          正在录音... 请说出您的支出内容
        </span>
        <span v-else-if="isProcessing" class="text-blue-500">
          正在识别语音...
        </span>
        <span v-else class="text-gray-500">
          点击按钮开始语音记账
        </span>
      </p>
      
      <!-- 识别结果 -->
      <div v-if="recognitionResult" class="bg-gray-50 rounded-lg p-4 text-left">
        <h4 class="font-medium text-gray-900 mb-2">识别结果：</h4>
        <p class="text-sm text-gray-700 mb-3">"{{ recognitionResult.text }}"</p>
        
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-white rounded-lg p-3 border">
            <label class="text-xs text-gray-500 block mb-1">金额</label>
            <input
              v-model="recognitionResult.amount"
              type="number"
              step="0.01"
              class="w-full text-lg font-semibold text-green-600 bg-transparent border-none outline-none"
              placeholder="0.00"
            />
          </div>
          
          <div class="bg-white rounded-lg p-3 border">
            <label class="text-xs text-gray-500 block mb-1">分类</label>
            <select
              v-model="recognitionResult.category"
              class="w-full text-sm font-medium bg-transparent border-none outline-none"
            >
              <option v-for="category in categoryStore.categories" :key="category.id" :value="category.id">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="confirmExpense"
            :disabled="!recognitionResult.amount || isSubmitting"
            class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            <span v-if="isSubmitting">保存中...</span>
            <span v-else>确认记录</span>
          </button>
          
          <button
            @click="clearResult"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            重新录音
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
    '餐饮': ['吃', '饭', '餐', '喝', '咖啡', '奶茶', '外卖', '食物'],
    '交通': ['打车', '地铁', '公交', '出租车', '滴滴', '车费', '油费'],
    '购物': ['买', '购', '商场', '超市', '淘宝', '京东', '衣服', '鞋子'],
    '娱乐': ['电影', '游戏', '唱歌', 'KTV', '娱乐', '玩'],
    '医疗': ['医院', '药', '看病', '体检', '医疗'],
    '教育': ['书', '课程', '培训', '学习', '教育']
  }
  
  let matchedCategory = '其他'
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      matchedCategory = category
      break
    }
  }
  
  // 找到对应的分类ID
  const category = categoryStore.categories.find(c => c.name === matchedCategory)
  
  recognitionResult.value = {
    text,
    amount,
    category: category?.id || categoryStore.categories[0]?.id || '',
    confidence: 0.8
  }
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