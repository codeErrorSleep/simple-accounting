# 记个大概 - 智能记账应用

一个基于 Vue 3 + TypeScript + Supabase 的现代化记账应用，支持语音记录、智能分类、预算管理和固定支出等功能。

## ✨ 功能特性

### 📊 核心功能
- **支出记录**: 手动输入或语音录入支出信息
- **智能分类**: 自动分类支出项目，支持自定义分类
- **统计分析**: 可视化图表展示支出趋势和分类占比
- **预算管理**: 设置月度预算，实时监控支出情况
- **固定支出**: 管理房租、电费等定期支出，自动生成记录

### 🎯 用户体验
- **多种登录方式**: 邮箱注册登录 + 游客模式
- **语音识别**: 支持语音输入支出信息
- **深色模式**: 完整的深色/浅色主题切换
- **响应式设计**: 完美适配移动端和桌面端
- **离线支持**: 游客模式下本地数据存储

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Recharts** - 数据可视化图表库

### 后端服务
- **Supabase** - 开源的 Firebase 替代方案
  - PostgreSQL 数据库
  - 实时订阅
  - 用户认证
  - 行级安全 (RLS)

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **PostCSS** - CSS 后处理器

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm 或 pnpm

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd ai-test
```

2. **安装依赖**
```bash
npm install
# 或
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **启动开发服务器**
```bash
npm run dev
# 或
pnpm dev
```

5. **访问应用**
打开浏览器访问 `http://localhost:5173`

### Supabase 配置

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在项目设置中获取 URL 和 anon key
3. 运行数据库迁移文件（位于 `supabase/migrations/` 目录）

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── AppLayout.vue   # 应用布局组件
│   ├── BottomNavigation.vue # 底部导航
│   ├── ExpenseOverview.vue  # 支出概览
│   └── VoiceRecorder.vue    # 语音录制组件
├── pages/              # 页面组件
│   ├── HomePage.vue    # 首页
│   ├── RecordPage.vue  # 记录页面
│   ├── StatisticsPage.vue # 统计页面
│   ├── BudgetPage.vue  # 预算页面
│   ├── RecurringExpensePage.vue # 固定支出页面
│   ├── SettingsPage.vue # 设置页面
│   └── LoginPage.vue   # 登录页面
├── stores/             # 状态管理
│   └── index.ts        # Pinia stores
├── lib/                # 工具库
│   ├── supabase.ts     # Supabase 客户端
│   └── utils.ts        # 工具函数
├── composables/        # 组合式函数
│   └── useTheme.ts     # 主题管理
└── types/              # 类型定义
    └── speech.d.ts     # 语音识别类型
```

## 🗄️ 数据库结构

### 主要数据表
- `categories` - 支出分类
- `expenses` - 支出记录
- `budgets` - 预算设置
- `recurring_expenses` - 固定支出

## 👨‍💻 开发者

- **开发者**: 邱少
- **技术支持**: qiushaotest@qq.com

## 📝 TODO 列表

### 🔥 高优先级
- [ ] **数据导出功能**
  - [ ] 支持导出 CSV/Excel 格式
  - [ ] 按时间范围导出
  - [ ] 按分类导出

- [ ] **数据备份与同步**
  - [ ] 自动云端备份
  - [ ] 跨设备数据同步
  - [ ] 数据恢复功能

- [ ] **高级统计功能**
  - [ ] 年度支出报告
  - [ ] 支出趋势预测
  - [ ] 分类支出对比分析
  - [ ] 自定义时间段统计

### 🚀 中优先级
- [ ] **用户体验优化**
  - [ ] 添加支出记录时的快捷分类建议
  - [ ] 支出记录的批量操作（删除、编辑、分类）
  - [ ] 更丰富的图表类型（饼图、折线图、柱状图）
  - [ ] 支出记录的搜索和筛选功能

- [ ] **通知与提醒**
  - [ ] 预算超支提醒
  - [ ] 固定支出到期提醒
  - [ ] 每日/每周支出总结推送
  - [ ] 自定义提醒规则

- [ ] **多语言支持**
  - [ ] 英文界面
  - [ ] 繁体中文支持
  - [ ] 语言切换功能

### 💡 低优先级
- [ ] **社交功能**
  - [ ] 支出记录分享
  - [ ] 家庭账本共享
  - [ ] 支出挑战和目标设定

- [ ] **高级功能**
  - [ ] 收入记录管理
  - [ ] 投资记录跟踪
  - [ ] 债务管理
  - [ ] 财务目标设定和跟踪

- [ ] **集成功能**
  - [ ] 银行卡消费自动导入
  - [ ] 支付宝/微信支付记录导入
  - [ ] 第三方记账应用数据迁移

### 🔧 技术优化
- [ ] **性能优化**
  - [ ] 图片懒加载
  - [ ] 虚拟滚动优化长列表
  - [ ] PWA 支持（离线使用）
  - [ ] 缓存策略优化

- [ ] **代码质量**
  - [ ] 单元测试覆盖
  - [ ] E2E 测试
  - [ ] 代码分割和懒加载
  - [ ] TypeScript 严格模式

- [ ] **安全性**
  - [ ] 数据加密存储
  - [ ] API 访问频率限制
  - [ ] 用户权限细化

### 🐛 已知问题
- [ ] 语音识别在某些浏览器上的兼容性问题
- [ ] 深色模式下部分图表颜色适配
- [ ] 移动端横屏适配优化

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request
