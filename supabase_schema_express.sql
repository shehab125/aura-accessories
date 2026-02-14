-- Aura Accessories — Supabase schema for Express backend
-- Run this in Supabase SQL Editor. Uses service_role from server; client uses anon for public read.
-- No Supabase Auth: app uses Express JWT; user_id in orders/ratings is our app user id (text).

-- Products (same as main schema)
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    name_ar text,
    description text,
    description_ar text,
    price numeric not null default 0,
    old_price numeric,
    gender text,
    category text,
    material text,
    style text,
    color text,
    badge text,
    rating numeric,
    reviews int,
    occasion text,
    dimensions text,
    weight text,
    care text,
    story text,
    story_ar text,
    sizes text[],
    colors text[],
    materials text[],
    images jsonb default '[]'::jsonb,
    video_url text,
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- Blog posts
create table if not exists blog_posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    title_ar text,
    content text,
    content_ar text,
    excerpt text,
    excerpt_ar text,
    category text,
    image_url text,
    published_at timestamp with time zone default now(),
    is_published boolean default true
);

-- Orders: user_id is our Express app user id (number as text)
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    order_number bigint generated always as identity,
    user_id text,
    customer_name text,
    customer_phone text,
    customer_email text,
    address text,
    notes text,
    payment_method text default 'cod',
    status text default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled')),
    total numeric not null default 0,
    created_at timestamp with time zone default now()
);

create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders (id) on delete cascade,
    product_id uuid references products (id),
    qty int not null default 1,
    price numeric not null default 0
);

-- Ratings: user_id is our Express app user id (text)
create table if not exists ratings (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products (id) on delete cascade,
    user_id text not null,
    stars int not null check (stars >= 1 and stars <= 5),
    comment text,
    created_at timestamp with time zone default now(),
    unique (product_id, user_id)
);

-- Allow public read on products and blog (for client anon key)
alter table products enable row level security;
alter table blog_posts enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ratings enable row level security;

create policy "products_select_public" on products for select using (is_active = true);
create policy "blog_select_public" on blog_posts for select using (is_published = true);

-- Service role (used by Express) bypasses RLS, so no need for insert/update policies for server.
-- If you need anon to insert orders, add: (better to do orders only via Express)
-- create policy "orders_insert_anon" on orders for insert with check (true);
-- For now, all writes go through Express with service key.

create policy "orders_select_all" on orders for select using (true);
create policy "orders_insert_all" on orders for insert with check (true);
create policy "orders_update_all" on orders for update using (true);
create policy "order_items_all" on order_items for all using (true);
create policy "ratings_select_all" on ratings for select using (true);
create policy "ratings_insert_all" on ratings for insert with check (true);
