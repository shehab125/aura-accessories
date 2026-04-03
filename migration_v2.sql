-- Additional schema for settings and missing tables
create table if not exists settings (
    id text primary key default 'main',
    data jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default now()
);

-- Ensure default settings entry exists
insert into settings (id, data)
values ('main', '{}')
on conflict (id) do nothing;

-- Fix any missing columns in products from recent updates
alter table products add column if not exists description_ar text;
alter table products add column if not exists story_ar text;

-- Add admin_note column to orders
alter table orders add column if not exists admin_note text;

-- Add customization columns to products
alter table products add column if not exists has_customization boolean default false;
alter table products add column if not exists customization_type text; -- 'letters', 'names'
alter table products add column if not exists customization_limit integer default 1;
alter table products add column if not exists custom_questions jsonb default '[]'::jsonb;

-- Add customization columns to order_items
alter table order_items add column if not exists customization_value text;
alter table order_items add column if not exists custom_answers jsonb default '[]'::jsonb;

