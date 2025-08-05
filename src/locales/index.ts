import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import enUS from './en-US.json'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

// 获取浏览器语言或本地存储的语言偏好
const getDefaultLocale = (): string => {
  const saved = localStorage.getItem('locale')
  if (saved && messages[saved as keyof typeof messages]) {
    return saved
  }
  
  const browserLang = navigator.language
  if (messages[browserLang as keyof typeof messages]) {
    return browserLang
  }
  
  // 处理浏览器语言的简化版本（如 'zh' -> 'zh-CN'）
  const langCode = browserLang.split('-')[0]
  if (langCode === 'zh') {
    return 'zh-CN'
  }
  if (langCode === 'en') {
    return 'en-US'
  }
  
  return 'zh-CN' // 默认中文
}

export const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true
})

// 切换语言的工具函数
export const switchLanguage = (locale: string) => {
  if (messages[locale as keyof typeof messages]) {
    i18n.global.locale.value = locale as any
    localStorage.setItem('locale', locale)
    return true
  }
  return false
}

// 获取当前语言
export const getCurrentLocale = () => {
  return i18n.global.locale.value
}

// 获取支持的语言列表
export const getSupportedLocales = () => {
  return Object.keys(messages)
}

export default i18n