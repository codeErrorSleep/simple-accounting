<template>
  <div class="language-switch">
    <div class="flex items-center space-x-2">
      <Globe class="w-5 h-5 text-gray-600" />
      <select 
        v-model="currentLocale" 
        @change="handleLanguageChange"
        class="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
      >
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe } from 'lucide-vue-next'
import { switchLanguage, getCurrentLocale } from '@/locales'

type SupportedLocale = 'zh-CN' | 'en-US'

const { locale, t } = useI18n()
const currentLocale = ref<SupportedLocale>(getCurrentLocale() as SupportedLocale)

const handleLanguageChange = () => {
  const success = switchLanguage(currentLocale.value)
  if (success) {
    // 可以添加成功提示
    console.log(t('settings.languageChanged'))
  }
}

// 监听全局语言变化
watch(locale, (newLocale) => {
  currentLocale.value = newLocale as SupportedLocale
})
</script>

<style scoped>
.language-switch {
  @apply flex items-center;
}

select {
  @apply cursor-pointer;
}

select:hover {
  @apply border-green-400;
}

select option {
  @apply py-2;
}
</style>