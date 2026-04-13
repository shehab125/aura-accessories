-- Aura Accessories: Coupon System Migration
-- Run this in your Supabase SQL Editor

-- 1. Create coupons table
create table if not exists coupons (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    discount_type text not null check (discount_type in ('percentage', 'fixed')),
    discount_value numeric not null check (discount_value > 0),
    min_order_amount numeric default 0,
    max_uses integer default null,     -- null = unlimited
    used_count integer default 0,
    expires_at timestamp with time zone default null,  -- null = no expiry
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 2. Add coupon columns to orders table (idempotent)
alter table orders
    add column if not exists coupon_code text default null,
    add column if not exists coupon_discount numeric default 0;

-- 3. Add admin_note column to orders if not exists
alter table orders
    add column if not exists admin_note text default null;

-- 4. Row level security for coupons (service role bypasses for Express)
alter table coupons enable row level security;

-- Allow public to read active coupons (for validation)
create policy "coupons_select_public" on coupons
    for select using (is_active = true);

-- Allow all operations via service role (Express server uses service key)
-- No extra policies needed for INSERT/UPDATE/DELETE as service role bypasses RLS

-- 5. Sample coupon (optional - remove if not needed)
-- insert into coupons (code, discount_type, discount_value, min_order_amount)
-- values ('WELCOME10', 'percentage', 10, 0);
