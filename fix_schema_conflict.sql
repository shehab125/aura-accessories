-- Fix conflicts before running supabase_schema_express.sql

-- 1. Drop conflicting policies that supabase_schema_express.sql tries to recreate
DROP POLICY IF EXISTS "products_select_public" ON products;
DROP POLICY IF EXISTS "blog_select_public" ON blog_posts;

-- 2. Drop tables that have incompatible schema (UUID user_id vs TEXT user_id)
-- We use CASCADE to ensure dependent tables/constraints are also removed
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Note: The 'profiles' table from the previous schema is left as is. 
-- It is not used by the Express schema (which uses its own user management or external auth), 
-- but it does not cause a conflict.
