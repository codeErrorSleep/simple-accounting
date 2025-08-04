-- 创建固定支出表 (recurring_expenses)
CREATE TABLE recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    name VARCHAR(100) NOT NULL, -- 固定支出名称，如"房租"、"电费"
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    frequency VARCHAR(10) NOT NULL CHECK (frequency IN ('weekly', 'monthly')), -- 重复频率
    start_date DATE NOT NULL, -- 开始日期
    next_due_date DATE NOT NULL, -- 下次到期日期
    is_active BOOLEAN DEFAULT true, -- 是否启用
    auto_generate BOOLEAN DEFAULT true, -- 是否自动生成支出记录
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX idx_recurring_expenses_next_due ON recurring_expenses(next_due_date);
CREATE INDEX idx_recurring_expenses_active ON recurring_expenses(is_active);
CREATE INDEX idx_recurring_expenses_category ON recurring_expenses(category_id);

-- 启用行级安全策略 (RLS)
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can manage their own recurring expenses" ON recurring_expenses
    FOR ALL USING (auth.uid() = user_id);

-- 权限设置
GRANT SELECT ON recurring_expenses TO anon;
GRANT ALL PRIVILEGES ON recurring_expenses TO authenticated;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为recurring_expenses表添加更新时间触发器
CREATE TRIGGER update_recurring_expenses_updated_at
    BEFORE UPDATE ON recurring_expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建自动生成支出记录的函数
CREATE OR REPLACE FUNCTION generate_recurring_expense_record(recurring_expense_id UUID)
RETURNS VOID AS $$
DECLARE
    rec_expense recurring_expenses%ROWTYPE;
    new_due_date DATE;
BEGIN
    -- 获取固定支出记录
    SELECT * INTO rec_expense FROM recurring_expenses WHERE id = recurring_expense_id AND is_active = true;
    
    IF rec_expense.id IS NULL THEN
        RETURN;
    END IF;
    
    -- 插入新的支出记录
    INSERT INTO expenses (user_id, category_id, amount, description, expense_date, source)
    VALUES (
        rec_expense.user_id,
        rec_expense.category_id,
        rec_expense.amount,
        COALESCE(rec_expense.description, rec_expense.name || ' (固定支出)'),
        rec_expense.next_due_date,
        'recurring'
    );
    
    -- 计算下次到期日期
    IF rec_expense.frequency = 'weekly' THEN
        new_due_date := rec_expense.next_due_date + INTERVAL '7 days';
    ELSIF rec_expense.frequency = 'monthly' THEN
        new_due_date := rec_expense.next_due_date + INTERVAL '1 month';
    END IF;
    
    -- 更新下次到期日期
    UPDATE recurring_expenses 
    SET next_due_date = new_due_date
    WHERE id = recurring_expense_id;
END;
$$ LANGUAGE plpgsql;

-- 修改expenses表的source字段约束，添加'recurring'选项
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_source_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_source_check 
    CHECK (source IN ('manual', 'voice', 'recurring'));