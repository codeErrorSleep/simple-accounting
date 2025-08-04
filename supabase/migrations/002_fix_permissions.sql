-- 修复表权限设置
-- 确保 anon 和 authenticated 角色有正确的访问权限

-- 为 categories 表设置权限
GRANT SELECT ON categories TO anon;
GRANT ALL PRIVILEGES ON categories TO authenticated;

-- 为 expenses 表设置权限
GRANT SELECT ON expenses TO anon;
GRANT ALL PRIVILEGES ON expenses TO authenticated;

-- 为 budgets 表设置权限
GRANT SELECT ON budgets TO anon;
GRANT ALL PRIVILEGES ON budgets TO authenticated;

-- 创建 RLS 策略以确保用户只能访问自己的数据

-- Categories 表的 RLS 策略
CREATE POLICY "Users can view all categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses 表的 RLS 策略
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets 表的 RLS 策略
CREATE POLICY "Users can view their own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- 确保 Supabase Auth 配置允许用户注册
-- 这需要在 Supabase Dashboard 中设置，但我们可以通过代码来处理

-- 插入默认分类数据（如果不存在）
INSERT INTO categories (name, icon, color, is_default, user_id) 
SELECT '餐饮', '🍽️', '#FF9800', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '餐饮' AND is_default = true);

INSERT INTO categories (name, icon, color, is_default, user_id) 
SELECT '交通', '🚗', '#2196F3', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '交通' AND is_default = true);

INSERT INTO categories (name, icon, color, is_default, user_id) 
SELECT '购物', '🛒', '#E91E63', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '购物' AND is_default = true);

INSERT INTO categories (name, icon, color, is_default, user_id) 
SELECT '娱乐', '🎬', '#9C27B0', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '娱乐' AND is_default = true);

INSERT INTO categories (name, icon, color, is_default, user_id) 
SELECT '医疗', '🏥', '#F44336', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '医疗' AND is_default = true);

INSERT INTO categories (name, icon, color, is_default, user_id) 
SELECT '教育', '📚', '#3F51B5', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '教育' AND is_default = true);

INSERT INTO categories (name, icon, color, is_default, user_id) 
SELECT '其他', '💰', '#607D8B', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = '其他' AND is_default = true);