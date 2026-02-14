-- Aura Accessories Supabase schema
-- This SQL script creates the necessary tables and Row Level Security (RLS)
-- policies for the Aura Accessories project. Run it inside your
-- Supabase project's SQL editor to initialize the database.

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Users profile (extra info beyond auth.users)
create table if not exists profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text,
    phone text,
    role text default 'customer' check (role in ('customer','admin')),
    ora_points int default 0,
    created_at timestamp with time zone default now()
);

-- Products table
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

-- Orders and order items
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    order_number bigint generated always as identity,
    user_id uuid references auth.users (id),
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

-- Ratings: user can rate a product once
create table if not exists ratings (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references products (id) on delete cascade,
    user_id uuid references auth.users (id) on delete cascade,
    stars int not null check (stars >= 1 and stars <= 5),
    comment text,
    created_at timestamp with time zone default now(),
    unique (product_id, user_id)
);

-- Enable RLS
alter table profiles enable row level security;
alter table products enable row level security;
alter table blog_posts enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ratings enable row level security;

-- Profiles: users can view and edit their own profile
create policy "profiles_select_self" on profiles
    for select using (auth.uid() = id);
create policy "profiles_update_self" on profiles
    for update using (auth.uid() = id);

-- Products: anyone can read active products
create policy "products_select_public" on products
    for select using (is_active);

-- Products: only admins can insert/update/delete
create policy "products_admin_modify" on products
    for all using (exists (
        select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    ));

-- Blog posts: public can read published posts
create policy "blog_select_public" on blog_posts
    for select using (is_published);

-- Blog posts: only admins can insert/update/delete
create policy "blog_admin_modify" on blog_posts
    for all using (exists (
        select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    ));

-- Orders: users can see their orders; admins can see all
create policy "orders_select_self" on orders
    for select using (
      (user_id = auth.uid()) OR
      exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
    );
-- Users can insert orders if logged in
create policy "orders_insert_auth" on orders
    for insert with check (auth.uid() is not null);
-- Admins can update orders
create policy "orders_admin_update" on orders
    for update using (exists (
        select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    ));

-- Order items: accessible via their parent order
create policy "order_items_select_order" on order_items
    for select using (
      exists (
        select 1 from orders o where o.id = order_items.order_id and (
          o.user_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
        )
      )
    );
create policy "order_items_insert_auth" on order_items
    for insert with check (auth.uid() is not null);

-- Ratings: only users who purchased the product can rate it
create policy "ratings_insert_if_purchased" on ratings
    for insert with check (
      exists (
        select 1
        from orders o
        join order_items oi on oi.order_id = o.id and oi.product_id = ratings.product_id
        where o.user_id = auth.uid() and o.status = 'delivered'
      )
    );

-- Ratings: users can update/delete their own rating
create policy "ratings_modify_self" on ratings
    for update using (auth.uid() = user_id);
create policy "ratings_delete_self" on ratings
    for delete using (auth.uid() = user_id);

-- Ratings: public can read
create policy "ratings_select_public" on ratings
    for select using (true);

-- Blog posts categories, genders, materials can be enforced via check constraints or enumerated separately if desired.