-- Cleanup script to prepare for running supabase_schema.sql
-- This drops conflicting tables (to ensure correct UUID types) and policies (to avoid "already exists" errors).

-- 1. Drop Tables that might have type mismatches (UUID vs Text user_id)
-- We drop these to ensure supabase_schema.sql recreates them with UUID foreign keys.
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE; -- Reset profiles matches the standard auth schema

-- 2. Drop Policies on persisted tables (Products, Blog Posts)
-- If these tables exist, we must drop their policies so supabase_schema.sql can recreate them.
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "products_admin_modify" ON products;

DROP POLICY IF EXISTS "blog_select_public" ON blog_posts;
DROP POLICY IF EXISTS "blog_admin_modify" ON blog_posts;

-- Note: We do not drop 'products' or 'blog_posts' tables themselves, preserving your product/blog data.
-- supabase_schema.sql will verify they exist and just apply the (newly cleaned) policies.
