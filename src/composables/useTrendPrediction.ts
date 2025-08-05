interface ExpenseData {
  date: string
  amount: number
  category: string
}

interface PredictionResult {
  predictedAmount: number
  trend: 'increasing' | 'decreasing' | 'stable'
  confidence: number
  dataPoints: Array<{ date: string; amount: number; isPredicted: boolean }>
}

// 线性回归算法
export function useLinearRegression() {
  const calculateLinearRegression = (data: ExpenseData[]) => {
    const n = data.length
    if (n < 3) return null
    
    // 将日期转换为数值（天数）
    const baseDate = new Date(data[0].date).getTime()
    const points = data.map((item) => ({
      x: (new Date(item.date).getTime() - baseDate) / (1000 * 60 * 60 * 24),
      y: item.amount
    }))
    
    // 计算线性回归系数
    const sumX = points.reduce((sum, p) => sum + p.x, 0)
    const sumY = points.reduce((sum, p) => sum + p.y, 0)
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // 计算R²决定系数
    const meanY = sumY / n
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0)
    const ssRes = points.reduce((sum, p) => {
      const predicted = slope * p.x + intercept
      return sum + Math.pow(p.y - predicted, 2)
    }, 0)
    const rSquared = 1 - (ssRes / ssTotal)
    
    return { slope, intercept, confidence: Math.max(0, rSquared) }
  }
  
  return { calculateLinearRegression }
}

// 移动平均算法
export function useMovingAverage() {
  const calculateMovingAverage = (data: ExpenseData[], windowSize: number = 7) => {
    if (data.length < windowSize) return []
    
    const result = []
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1)
      const average = window.reduce((sum, item) => sum + item.amount, 0) / windowSize
      result.push({
        date: data[i].date,
        amount: average
      })
    }
    
    return result
  }
  
  const predictNextPeriod = (movingAverages: Array<{date: string, amount: number}>, periods: number) => {
    if (movingAverages.length < 3) return []
    
    const recent = movingAverages.slice(-3)
    const trend = (recent[2].amount - recent[0].amount) / 2
    
    const predictions = []
    const lastDate = new Date(recent[recent.length - 1].date)
    
    for (let i = 1; i <= periods; i++) {
      const nextDate = new Date(lastDate)
      nextDate.setDate(lastDate.getDate() + i * 7) // 按周预测
      
      predictions.push({
        date: nextDate.toISOString().split('T')[0],
        amount: Math.max(0, recent[recent.length - 1].amount + trend * i),
        isPredicted: true
      })
    }
    
    return predictions
  }
  
  return { calculateMovingAverage, predictNextPeriod }
}

// 主预测引擎
export function useTrendPrediction() {
  const { calculateLinearRegression } = useLinearRegression()
  const { calculateMovingAverage, predictNextPeriod } = useMovingAverage()
  
  const generateLinearPrediction = async (
    data: ExpenseData[], 
    predictionMonths: number
  ): Promise<PredictionResult> => {
    const regression = calculateLinearRegression(data)
    if (!regression) {
      throw new Error('数据不足，无法进行线性回归预测')
    }
    
    const { slope, intercept, confidence } = regression
    const baseDate = new Date(data[0].date).getTime()
    const lastDate = new Date(data[data.length - 1].date)
    
    // 生成预测数据点
    const predictions = []
    for (let i = 1; i <= predictionMonths * 4; i++) { // 按周预测
      const nextDate = new Date(lastDate)
      nextDate.setDate(lastDate.getDate() + i * 7)
      
      const daysDiff = (nextDate.getTime() - baseDate) / (1000 * 60 * 60 * 24)
      const predictedAmount = Math.max(0, slope * daysDiff + intercept)
      
      predictions.push({
        date: nextDate.toISOString().split('T')[0],
        amount: predictedAmount,
        isPredicted: true
      })
    }
    
    // 历史数据点
    const historicalPoints = data.map(item => ({
      date: item.date,
      amount: item.amount,
      isPredicted: false
    }))
    
    // 确定趋势
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (slope > 10) trend = 'increasing'
    else if (slope < -10) trend = 'decreasing'
    
    return {
      predictedAmount: predictions[3]?.amount || 0, // 下个月预测
      trend,
      confidence,
      dataPoints: [...historicalPoints, ...predictions]
    }
  }
  
  const generateMovingAveragePrediction = async (
    data: ExpenseData[], 
    predictionMonths: number
  ): Promise<PredictionResult> => {
    const movingAverages = calculateMovingAverage(data, 7)
    const predictions = predictNextPeriod(movingAverages, predictionMonths * 4)
    
    if (predictions.length === 0) {
      throw new Error('数据不足，无法进行移动平均预测')
    }
    
    // 历史数据点
    const historicalPoints = data.map(item => ({
      date: item.date,
      amount: item.amount,
      isPredicted: false
    }))
    
    // 计算趋势
    const recentAvg = movingAverages.slice(-4).reduce((sum, item) => sum + item.amount, 0) / 4
    const earlierAvg = movingAverages.slice(-8, -4).reduce((sum, item) => sum + item.amount, 0) / 4
    const trendValue = recentAvg - earlierAvg
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (trendValue > 50) trend = 'increasing'
    else if (trendValue < -50) trend = 'decreasing'
    
    // 简单的置信度计算
    const variance = movingAverages.reduce((sum, item) => {
      return sum + Math.pow(item.amount - recentAvg, 2)
    }, 0) / movingAverages.length
    const confidence = Math.max(0.3, 1 - (variance / (recentAvg * recentAvg)))
    
    return {
      predictedAmount: predictions[3]?.amount || 0,
      trend,
      confidence,
      dataPoints: [...historicalPoints, ...predictions]
    }
  }
  
  const generateCombinedPrediction = async (
    data: ExpenseData[], 
    predictionMonths: number
  ): Promise<PredictionResult> => {
    try {
      const linearResult = await generateLinearPrediction(data, predictionMonths)
      const movingAvgResult = await generateMovingAveragePrediction(data, predictionMonths)
      
      // 组合两种预测结果
      const combinedAmount = (linearResult.predictedAmount + movingAvgResult.predictedAmount) / 2
      const combinedConfidence = (linearResult.confidence + movingAvgResult.confidence) / 2
      
      // 选择更可靠的趋势判断
      const trend = linearResult.confidence > movingAvgResult.confidence 
        ? linearResult.trend 
        : movingAvgResult.trend
      
      // 组合数据点（使用线性回归的数据点作为基础）
      const dataPoints = linearResult.dataPoints.map((point, index) => {
        if (point.isPredicted && movingAvgResult.dataPoints[index]) {
          return {
            ...point,
            amount: (point.amount + movingAvgResult.dataPoints[index].amount) / 2
          }
        }
        return point
      })
      
      return {
        predictedAmount: combinedAmount,
        trend,
        confidence: combinedConfidence,
        dataPoints
      }
    } catch (error) {
      // 如果组合预测失败，尝试单独的预测方法
      try {
        return await generateLinearPrediction(data, predictionMonths)
      } catch {
        return await generateMovingAveragePrediction(data, predictionMonths)
      }
    }
  }
  
  const generatePrediction = async (
    expenses: ExpenseData[],
    options: {
      category?: string
      predictionMonths: number
      algorithm: 'linear' | 'moving_average' | 'combined'
    }
  ): Promise<PredictionResult | null> => {
    // 数据预处理
    let filteredData = expenses
    if (options.category) {
      filteredData = expenses.filter(e => e.category === options.category)
    }
    
    // 按日期排序
    filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // 检查数据量是否足够
    if (filteredData.length < 10) { // 至少需要10条记录
      return null
    }
    
    try {
      let prediction: PredictionResult
      
      switch (options.algorithm) {
        case 'linear':
          prediction = await generateLinearPrediction(filteredData, options.predictionMonths)
          break
        case 'moving_average':
          prediction = await generateMovingAveragePrediction(filteredData, options.predictionMonths)
          break
        case 'combined':
        default:
          prediction = await generateCombinedPrediction(filteredData, options.predictionMonths)
          break
      }
      
      return prediction
    } catch (error) {
      console.error('预测生成失败:', error)
      return null
    }
  }
  
  return { generatePrediction }
}