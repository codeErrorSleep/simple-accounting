import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase, type Expense, type Category, type Budget, type RecurringExpense } from '@/lib/supabase'

// 用户认证状态
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    if (data.user) {
      user.value = data.user
    }
    
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined // 禁用邮箱验证
      }
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    // 如果注册成功，自动设置用户状态
    if (data.user) {
      user.value = data.user
    }
    
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
  }
  
  const logout = signOut
  const login = signIn
  const register = signUp
  
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    return { data, error }
  }
  
  const loginAsGuest = () => {
    // 设置游客模式标识
    user.value = {
      id: 'guest',
      email: 'guest@example.com',
      user_metadata: { name: '游客用户' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      role: 'guest'
    } as any
    
    // 存储游客模式标识
    localStorage.setItem('isGuestMode', 'true')
  }
  
  const isGuestMode = () => {
    return localStorage.getItem('isGuestMode') === 'true' || user.value?.id === 'guest'
  }

  const initAuth = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
    })
  }

  return {
    user: readonly(user),
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    initAuth,
    login,
    logout,
    register,
    loginWithGoogle,
    loginAsGuest,
    isGuestMode,
  }
})

// 支出记录状态
export const useExpenseStore = defineStore('expense', () => {
  const expenses = ref<Expense[]>([])
  const loading = ref(false)

  const fetchExpenses = async () => {
    const authStore = useAuthStore()
    loading.value = true
    
    try {
      // 游客模式：从本地存储读取
      if (authStore.isGuestMode()) {
        const guestExpenses = JSON.parse(localStorage.getItem('guestExpenses') || '[]')
        expenses.value = guestExpenses
        return guestExpenses
      }
      
      // 正常用户：从Supabase读取
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories(name, icon, color)
        `)
        .order('expense_date', { ascending: false })

      if (error) throw error
      expenses.value = data || []
    } catch (error) {
      console.error('获取支出记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
    const authStore = useAuthStore()
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const newExpense = {
        ...expense,
        id: crypto.randomUUID(),
        user_id: 'guest',
        created_at: new Date().toISOString(),
      }
      
      expenses.value.unshift(newExpense)
      
      // 保存到本地存储
      const guestExpenses = JSON.parse(localStorage.getItem('guestExpenses') || '[]')
      guestExpenses.unshift(newExpense)
      localStorage.setItem('guestExpenses', JSON.stringify(guestExpenses))
      
      return { data: newExpense, error: null }
    }
    
    // 正常用户：使用Supabase
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()

      if (error) throw error
      await fetchExpenses() // 重新获取数据
      return { data, error: null }
    } catch (error) {
      console.error('添加支出记录失败:', error)
      return { data: null, error }
    }
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      await fetchExpenses()
      return { data, error: null }
    } catch (error) {
      console.error('更新支出记录失败:', error)
      return { data: null, error }
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchExpenses()
      return { error: null }
    } catch (error) {
      console.error('删除支出记录失败:', error)
      return { error }
    }
  }

  // 计算统计数据
  const todayTotal = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return expenses.value
      .filter(expense => expense.expense_date === today)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })

  const weekTotal = computed(() => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekStartStr = weekStart.toISOString().split('T')[0]
    
    return expenses.value
      .filter(expense => expense.expense_date >= weekStartStr)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })

  const monthTotal = computed(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartStr = monthStart.toISOString().split('T')[0]
    
    return expenses.value
      .filter(expense => expense.expense_date >= monthStartStr)
      .reduce((sum, expense) => sum + expense.amount, 0)
  })

  return {
    expenses,
    loading,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    todayTotal,
    weekTotal,
    monthTotal,
  }
})

// 分类状态
export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  const fetchCategories = async () => {
    const authStore = useAuthStore()
    loading.value = true
    
    try {
      // 游客模式：使用默认分类
      if (authStore.isGuestMode()) {
        const defaultCategories = [
          { id: '1', name: '餐饮', icon: '🍽️', color: '#FF6B6B', is_default: true, created_at: new Date().toISOString() },
          { id: '2', name: '交通', icon: '🚗', color: '#4ECDC4', is_default: true, created_at: new Date().toISOString() },
          { id: '3', name: '购物', icon: '🛍️', color: '#45B7D1', is_default: true, created_at: new Date().toISOString() },
          { id: '4', name: '娱乐', icon: '🎮', color: '#96CEB4', is_default: true, created_at: new Date().toISOString() },
          { id: '5', name: '医疗', icon: '🏥', color: '#FFEAA7', is_default: true, created_at: new Date().toISOString() },
          { id: '6', name: '教育', icon: '📚', color: '#DDA0DD', is_default: true, created_at: new Date().toISOString() },
          { id: '7', name: '住房', icon: '🏠', color: '#98D8C8', is_default: true, created_at: new Date().toISOString() },
          { id: '8', name: '其他', icon: '💰', color: '#F7DC6F', is_default: true, created_at: new Date().toISOString() }
        ]
        
        // 获取用户自定义分类
        const guestCategories = JSON.parse(localStorage.getItem('guestCategories') || '[]')
        categories.value = [...defaultCategories, ...guestCategories]
        return categories.value
      }
      
      // 正常用户：从Supabase读取
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('is_default', { ascending: false })

      if (error) throw error
      categories.value = data || []
    } catch (error) {
      console.error('获取分类失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    const authStore = useAuthStore()
    
    const categoryWithDefaults = {
      ...categoryData,
      is_default: false
    }
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const newCategory = {
        ...categoryWithDefaults,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      }
      
      // 保存到本地存储
      const guestCategories = JSON.parse(localStorage.getItem('guestCategories') || '[]')
      guestCategories.push(newCategory)
      localStorage.setItem('guestCategories', JSON.stringify(guestCategories))
      
      await fetchCategories() // 重新获取数据
      return { data: newCategory, error: null }
    }
    
    // 正常用户：使用Supabase
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryWithDefaults])
        .select()
        .single()
      
      if (error) throw error
      await fetchCategories()
      return { data, error: null }
    } catch (error) {
      console.error('添加分类失败:', error)
      return { data: null, error }
    }
  }

  const deleteCategory = async (categoryId: string) => {
    const authStore = useAuthStore()
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const guestCategories = JSON.parse(localStorage.getItem('guestCategories') || '[]')
      const filteredCategories = guestCategories.filter((c: Category) => c.id !== categoryId)
      
      localStorage.setItem('guestCategories', JSON.stringify(filteredCategories))
      await fetchCategories() // 重新获取数据
      
      return { error: null }
    }
    
    // 正常用户：使用Supabase
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
      await fetchCategories()
      return { error: null }
    } catch (error) {
      console.error('删除分类失败:', error)
      return { error }
    }
  }

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    deleteCategory,
  }
})

// 预算状态
export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref<Budget[]>([])
  const loading = ref(false)

  const fetchBudgets = async () => {
    const authStore = useAuthStore()
    loading.value = true
    
    try {
      // 游客模式：从本地存储读取
      if (authStore.isGuestMode()) {
        const guestBudgets = JSON.parse(localStorage.getItem('guestBudgets') || '[]')
        budgets.value = guestBudgets
        return guestBudgets
      }
      
      // 正常用户：从Supabase读取
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories(name, icon, color)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      budgets.value = data || []
    } catch (error) {
      console.error('获取预算失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'end_date'>) => {
    const authStore = useAuthStore()
    
    // 计算结束日期
    const startDate = new Date(budget.start_date)
    let endDate: Date
    
    switch (budget.period_type) {
      case 'weekly':
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 7)
        break
      case 'monthly':
        endDate = new Date(startDate)
        endDate.setMonth(startDate.getMonth() + 1)
        break
      case 'yearly':
        endDate = new Date(startDate)
        endDate.setFullYear(startDate.getFullYear() + 1)
        break
      default:
        endDate = new Date(startDate)
        endDate.setMonth(startDate.getMonth() + 1)
    }
    
    const budgetWithEndDate = {
      ...budget,
      end_date: endDate.toISOString().split('T')[0]
    }
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const newBudget = {
        ...budgetWithEndDate,
        id: crypto.randomUUID(),
        user_id: 'guest',
        created_at: new Date().toISOString(),
      }
      
      budgets.value.unshift(newBudget)
      
      // 保存到本地存储
      const guestBudgets = JSON.parse(localStorage.getItem('guestBudgets') || '[]')
      guestBudgets.unshift(newBudget)
      localStorage.setItem('guestBudgets', JSON.stringify(guestBudgets))
      
      return { data: newBudget, error: null }
    }
    
    // 正常用户：使用Supabase
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([budgetWithEndDate])
        .select()

      if (error) throw error
      await fetchBudgets()
      return { data, error: null }
    } catch (error) {
      console.error('添加预算失败:', error)
      return { data: null, error }
    }
  }
  
  const updateBudget = async (budgetId: string, budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'end_date'>) => {
    const authStore = useAuthStore()
    
    // 计算结束日期
    const startDate = new Date(budget.start_date)
    let endDate: Date
    
    switch (budget.period_type) {
      case 'weekly':
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 7)
        break
      case 'monthly':
        endDate = new Date(startDate)
        endDate.setMonth(startDate.getMonth() + 1)
        break
      case 'yearly':
        endDate = new Date(startDate)
        endDate.setFullYear(startDate.getFullYear() + 1)
        break
      default:
        endDate = new Date(startDate)
        endDate.setMonth(startDate.getMonth() + 1)
    }
    
    const budgetWithEndDate = {
      ...budget,
      end_date: endDate.toISOString().split('T')[0]
    }
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const guestBudgets = JSON.parse(localStorage.getItem('guestBudgets') || '[]')
      const budgetIndex = guestBudgets.findIndex((b: Budget) => b.id === budgetId)
      
      if (budgetIndex !== -1) {
        guestBudgets[budgetIndex] = {
          ...guestBudgets[budgetIndex],
          ...budgetWithEndDate
        }
        
        localStorage.setItem('guestBudgets', JSON.stringify(guestBudgets))
        await fetchBudgets() // 重新获取数据
        
        return { data: guestBudgets[budgetIndex], error: null }
      }
      
      return { data: null, error: new Error('预算不存在') }
    }
    
    // 正常用户：使用Supabase
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(budgetWithEndDate)
        .eq('id', budgetId)
        .select()

      if (error) throw error
      await fetchBudgets()
      return { data, error: null }
    } catch (error) {
      console.error('更新预算失败:', error)
      return { data: null, error }
    }
  }
  
  const deleteBudget = async (budgetId: string) => {
    const authStore = useAuthStore()
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const guestBudgets = JSON.parse(localStorage.getItem('guestBudgets') || '[]')
      const filteredBudgets = guestBudgets.filter((b: Budget) => b.id !== budgetId)
      
      localStorage.setItem('guestBudgets', JSON.stringify(filteredBudgets))
      await fetchBudgets() // 重新获取数据
      
      return { error: null }
    }
    
    // 正常用户：使用Supabase
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)

      if (error) throw error
      await fetchBudgets()
      return { error: null }
    } catch (error) {
      console.error('删除预算失败:', error)
      return { error }
    }
  }

  return {
    budgets,
    loading,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
  }
})

// 固定支出状态
export const useRecurringExpenseStore = defineStore('recurringExpense', () => {
  const recurringExpenses = ref<RecurringExpense[]>([])
  const loading = ref(false)

  const fetchRecurringExpenses = async () => {
    const authStore = useAuthStore()
    loading.value = true
    
    try {
      // 游客模式：从本地存储读取
      if (authStore.isGuestMode()) {
        const guestRecurringExpenses = JSON.parse(localStorage.getItem('guestRecurringExpenses') || '[]')
        recurringExpenses.value = guestRecurringExpenses
        return guestRecurringExpenses
      }
      
      // 正常用户：从Supabase读取
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select(`
          *,
          categories(name, icon, color)
        `)
        .order('next_due_date', { ascending: true })

      if (error) throw error
      recurringExpenses.value = data || []
    } catch (error) {
      console.error('获取固定支出失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addRecurringExpense = async (expense: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const authStore = useAuthStore()
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const newRecurringExpense = {
        ...expense,
        id: crypto.randomUUID(),
        user_id: 'guest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      recurringExpenses.value.push(newRecurringExpense)
      
      // 保存到本地存储
      const guestRecurringExpenses = JSON.parse(localStorage.getItem('guestRecurringExpenses') || '[]')
      guestRecurringExpenses.push(newRecurringExpense)
      localStorage.setItem('guestRecurringExpenses', JSON.stringify(guestRecurringExpenses))
      
      return { data: newRecurringExpense, error: null }
    }
    
    // 正常用户：使用Supabase
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert([expense])
        .select()

      if (error) throw error
      await fetchRecurringExpenses()
      return { data, error: null }
    } catch (error) {
      console.error('添加固定支出失败:', error)
      return { data: null, error }
    }
  }

  const updateRecurringExpense = async (id: string, updates: Partial<RecurringExpense>) => {
    const authStore = useAuthStore()
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const guestRecurringExpenses = JSON.parse(localStorage.getItem('guestRecurringExpenses') || '[]')
      const expenseIndex = guestRecurringExpenses.findIndex((e: RecurringExpense) => e.id === id)
      
      if (expenseIndex !== -1) {
        guestRecurringExpenses[expenseIndex] = {
          ...guestRecurringExpenses[expenseIndex],
          ...updates,
          updated_at: new Date().toISOString()
        }
        
        localStorage.setItem('guestRecurringExpenses', JSON.stringify(guestRecurringExpenses))
        await fetchRecurringExpenses()
        
        return { data: guestRecurringExpenses[expenseIndex], error: null }
      }
      
      return { data: null, error: new Error('固定支出不存在') }
    }
    
    // 正常用户：使用Supabase
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      await fetchRecurringExpenses()
      return { data, error: null }
    } catch (error) {
      console.error('更新固定支出失败:', error)
      return { data: null, error }
    }
  }

  const deleteRecurringExpense = async (id: string) => {
    const authStore = useAuthStore()
    
    // 游客模式：使用本地存储
    if (authStore.isGuestMode()) {
      const guestRecurringExpenses = JSON.parse(localStorage.getItem('guestRecurringExpenses') || '[]')
      const filteredExpenses = guestRecurringExpenses.filter((e: RecurringExpense) => e.id !== id)
      
      localStorage.setItem('guestRecurringExpenses', JSON.stringify(filteredExpenses))
      await fetchRecurringExpenses()
      
      return { error: null }
    }
    
    // 正常用户：使用Supabase
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchRecurringExpenses()
      return { error: null }
    } catch (error) {
      console.error('删除固定支出失败:', error)
      return { error }
    }
  }

  // 生成固定支出记录
  const generateRecurringExpenseRecord = async (recurringExpenseId: string) => {
    const authStore = useAuthStore()
    const expenseStore = useExpenseStore()
    
    const recurringExpense = recurringExpenses.value.find(e => e.id === recurringExpenseId)
    if (!recurringExpense || !recurringExpense.is_active) {
      return { error: new Error('固定支出不存在或已禁用') }
    }
    
    // 创建新的支出记录
    const newExpense = {
      category_id: recurringExpense.category_id,
      amount: recurringExpense.amount,
      description: recurringExpense.description || `${recurringExpense.name} (固定支出)`,
      expense_date: recurringExpense.next_due_date,
      source: 'recurring' as const
    }
    
    // 添加支出记录
    const { data: expenseData, error: expenseError } = await expenseStore.addExpense(newExpense)
    if (expenseError) {
      return { error: expenseError }
    }
    
    // 计算下次到期日期
    const nextDueDate = new Date(recurringExpense.next_due_date)
    if (recurringExpense.frequency === 'weekly') {
      nextDueDate.setDate(nextDueDate.getDate() + 7)
    } else if (recurringExpense.frequency === 'monthly') {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1)
    }
    
    // 更新下次到期日期
    const { error: updateError } = await updateRecurringExpense(recurringExpenseId, {
      next_due_date: nextDueDate.toISOString().split('T')[0]
    })
    
    if (updateError) {
      return { error: updateError }
    }
    
    return { data: expenseData, error: null }
  }

  // 获取即将到期的固定支出
  const getUpcomingRecurringExpenses = computed(() => {
    const today = new Date()
    const threeDaysLater = new Date()
    threeDaysLater.setDate(today.getDate() + 3)
    
    return recurringExpenses.value.filter(expense => {
      if (!expense.is_active) return false
      
      const dueDate = new Date(expense.next_due_date)
      return dueDate >= today && dueDate <= threeDaysLater
    })
  })

  // 获取今日到期的固定支出
  const getTodayDueRecurringExpenses = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    
    return recurringExpenses.value.filter(expense => {
      return expense.is_active && expense.next_due_date === today
    })
  })

  return {
    recurringExpenses,
    loading,
    fetchRecurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    generateRecurringExpenseRecord,
    getUpcomingRecurringExpenses,
    getTodayDueRecurringExpenses,
  }
})