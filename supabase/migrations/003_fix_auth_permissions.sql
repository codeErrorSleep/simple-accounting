-- 修复认证和权限问题
-- 删除可能冲突的策略并重新创建

-- 删除现有策略
DROP POLICY IF EXISTS "Users can view all categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can manage their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

-- 重新创建 Categories 表的策略
CREATE POLICY "Allow public read access to default categories" ON categories
  FOR SELECT USING (is_default = true OR user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to manage their categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 重新创建 Expenses 表的策略
CREATE POLICY "Allow users to view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 重新创建 Budgets 表的策略
CREATE POLICY "Allow users to view their own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- 确保权限正确设置
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 更新默认分类，确保它们可以被所有用户访问
UPDATE categories SET user_id = NULL WHERE is_default = true;