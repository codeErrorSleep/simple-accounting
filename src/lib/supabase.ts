import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表类型定义
export interface Expense {
  id: string
  user_id: string
  category_id: string
  amount: number
  description?: string
  expense_date: string
  source: 'manual' | 'voice' | 'recurring'
  created_at: string
}

export interface Category {
  id: string
  user_id?: string
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period_type: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
  created_at: string
}

export interface RecurringExpense {
  id: string
  user_id: string
  category_id: string
  name: string
  amount: number
  description?: string
  frequency: 'weekly' | 'monthly'
  start_date: string
  next_due_date: string
  is_active: boolean
  auto_generate: boolean
  created_at: string
  updated_at: string
}

// 语音识别结果类型
export interface VoiceRecognitionResult {
  text: string
  amount: number
  category: string
  confidence: number
}