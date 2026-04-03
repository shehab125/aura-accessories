-- Add variant-specific pricing columns to the products table
alter table products add column if not exists price_gold numeric(10,2);
alter table products add column if not exists old_price_gold numeric(10,2);
alter table products add column if not exists price_silver numeric(10,2);
alter table products add column if not exists old_price_silver numeric(10,2);

-- Also add a column for default material if needed, but for now we'll stick to 'silver' as default in code.
-- Migration complete.
