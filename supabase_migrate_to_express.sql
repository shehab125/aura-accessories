-- Migration: من supabase_schema.sql إلى Express
-- شغّله مرة واحدة في Supabase SQL Editor بعد ما تكون شغّلت supabase_schema.sql

-- 1) حذف الـ policies القديمة اللي بتتعارض
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_admin_modify" ON products;
DROP POLICY IF EXISTS "blog_select_public" ON blog_posts;
DROP POLICY IF EXISTS "blog_admin_modify" ON blog_posts;
DROP POLICY IF EXISTS "orders_select_self" ON orders;
DROP POLICY IF EXISTS "orders_insert_auth" ON orders;
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
DROP POLICY IF EXISTS "order_items_select_order" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_auth" ON order_items;
DROP POLICY IF EXISTS "ratings_select_public" ON ratings;
DROP POLICY IF EXISTS "ratings_insert_if_purchased" ON ratings;
DROP POLICY IF EXISTS "ratings_modify_self" ON ratings;
DROP POLICY IF EXISTS "ratings_delete_self" ON ratings;

-- 2) تعديل orders: user_id من uuid إلى text (عشان Express)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ALTER COLUMN user_id TYPE text USING user_id::text;

-- 3) تعديل ratings: user_id من uuid إلى text
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_ratings_product_id_user_id_key;
ALTER TABLE ratings ALTER COLUMN user_id TYPE text USING user_id::text;
ALTER TABLE ratings ADD CONSTRAINT ratings_product_id_user_id_key UNIQUE (product_id, user_id);

-- 4) إضافة الـ policies الجديدة للـ Express
CREATE POLICY "products_select_public" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "blog_select_public" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "orders_select_all" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert_all" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_all" ON orders FOR UPDATE USING (true);
CREATE POLICY "order_items_all" ON order_items FOR ALL USING (true);
CREATE POLICY "ratings_select_all" ON ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert_all" ON ratings FOR INSERT WITH CHECK (true);
