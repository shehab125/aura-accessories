-- Migration: Add custom_requests table
-- Execute this script in your Supabase SQL Editor
-- This version is compatible with the Express schema (uses users table)

CREATE TABLE IF NOT EXISTS public.custom_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_contact TEXT NOT NULL,
    image_url TEXT,
    description TEXT NOT NULL,
    price NUMERIC(10, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'priced', 'ordered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    admin_note TEXT
);

-- Turn on row level security
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Note: Since this project uses an Express backend with a Service Key, 
-- RLS is bypassed for server-side operations. These policies allow 
-- for general access compatible with the supabase_schema_express.sql pattern.

CREATE POLICY "Enable all access for custom_requests" 
ON public.custom_requests FOR ALL 
USING (true) 
WITH CHECK (true);
