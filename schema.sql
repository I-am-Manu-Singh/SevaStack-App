-- ==========================================
-- SEVASTACK MULTI-MERCHANT APP DATABASE SCHEMA
-- ==========================================
-- This script sets up the tables, indexes, row-level security (RLS) policies,
-- and automated triggers in Supabase PostgreSQL.

-- OPTIONAL CLEAN SLATE (Uncomment if you want to drop existing tables and start fresh):
-- DROP TABLE IF EXISTS public.barber_chairs CASCADE;
-- DROP TABLE IF EXISTS public.barber_queue CASCADE;
-- DROP TABLE IF EXISTS public.tiffin_subscriptions CASCADE;
-- DROP TABLE IF EXISTS public.hostel_residents CASCADE;
-- DROP TABLE IF EXISTS public.laundry_orders CASCADE;
-- DROP TABLE IF EXISTS public.leads CASCADE;
-- DROP TABLE IF EXISTS public.notifications CASCADE;
-- DROP TABLE IF EXISTS public.staff CASCADE;
-- DROP TABLE IF EXISTS public.khata_records CASCADE;
-- DROP TABLE IF EXISTS public.inventory CASCADE;
-- DROP TABLE IF EXISTS public.appointments CASCADE;
-- DROP TABLE IF EXISTS public.services CASCADE;
-- DROP TABLE IF EXISTS public.merchants CASCADE;

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------
-- 1. MERCHANTS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    business_type TEXT DEFAULT 'Barber', -- 'Barber', 'Tailor', 'Kirana', 'Pharmacy', 'Tiffin', 'Milk', 'Laundry', 'Cafe', 'Jewelry', etc.
    address TEXT,
    image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_merchant UNIQUE (user_id)
);

-- Safe Alter: Add column if table existed but lacked this column
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'Barber';
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80';
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Index for searching business type and users fast
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON public.merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_business_type ON public.merchants(business_type);

-- --------------------------------------------------
-- 2. SERVICES & CATALOG PRODUCTS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT DEFAULT 'General',
    unit TEXT, -- 'kg', 'piece', 'session', 'month', etc.
    business_type TEXT DEFAULT 'Barber',
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1521566652839-697aa473761a?w=400&q=80',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe Alter: Add column if table existed but lacked this column
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'Barber';

CREATE INDEX IF NOT EXISTS idx_services_merchant_id ON public.services(merchant_id);
CREATE INDEX IF NOT EXISTS idx_services_business_type ON public.services(business_type);

-- --------------------------------------------------
-- 3. APPOINTMENTS & SERVICE BOOKINGS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    service TEXT NOT NULL,
    time TEXT NOT NULL, -- Selected slot time (e.g. '10:00 AM')
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    business_type TEXT DEFAULT 'Barber',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe Alter: Add column if table existed but lacked this column
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'Barber';

CREATE INDEX IF NOT EXISTS idx_appointments_merchant_id ON public.appointments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- --------------------------------------------------
-- 4. INVENTORY TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    category TEXT DEFAULT 'General',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_merchant_id ON public.inventory(merchant_id);

-- --------------------------------------------------
-- 5. KHATA RECORDS (LEDGER) TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.khata_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'income', -- 'income', 'expense'
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_khata_records_merchant_id ON public.khata_records(merchant_id);

-- --------------------------------------------------
-- 6. STAFF TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Helper',
    is_present BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_merchant_id ON public.staff(merchant_id);

-- --------------------------------------------------
-- 7. NOTIFICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'order', 'stock', 'payout', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    time TEXT DEFAULT 'Just now',
    is_unread BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safe Alter: Add column if table existed but lacked this column
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_unread BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_notifications_merchant_id ON public.notifications(merchant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_unread ON public.notifications(is_unread);

-- --------------------------------------------------
-- 8. LEADS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    contact TEXT,
    status TEXT DEFAULT 'New', -- 'New', 'Contacted', 'Converted', 'Closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_merchant_id ON public.leads(merchant_id);

-- --------------------------------------------------
-- 9. SPECIFIC BUSINESS SUB-TABLES (Optional Extension)
-- --------------------------------------------------

-- Barber Queue / Stylist Chairs
CREATE TABLE IF NOT EXISTS public.barber_chairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    barber_name TEXT NOT NULL,
    customer_name TEXT DEFAULT 'Vacant Chair',
    service TEXT DEFAULT 'None',
    time_remaining INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Vacant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.barber_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    hostel TEXT,
    service TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tiffin Subscriptions
CREATE TABLE IF NOT EXISTS public.tiffin_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    hostel_address TEXT,
    plan_type TEXT NOT NULL,
    days_left INTEGER DEFAULT 30,
    spice_level TEXT DEFAULT 'Medium',
    phone TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Hostel Residents
CREATE TABLE IF NOT EXISTS public.hostel_residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    college_affiliation TEXT,
    rent_due NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Laundry Orders
CREATE TABLE IF NOT EXISTS public.laundry_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    room_number TEXT,
    items_count INTEGER DEFAULT 1,
    service_type TEXT NOT NULL,
    amount NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Received',
    delicate_tag TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khata_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to make the script completely idempotent
DROP POLICY IF EXISTS "Allow public read access to merchant profiles" ON public.merchants;
DROP POLICY IF EXISTS "Allow merchants to manage their own profile" ON public.merchants;
DROP POLICY IF EXISTS "Allow public read access to catalog services" ON public.services;
DROP POLICY IF EXISTS "Allow merchants to manage their services" ON public.services;
DROP POLICY IF EXISTS "Allow users to view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow anyone to request an appointment" ON public.appointments;
DROP POLICY IF EXISTS "Allow merchants to update appointment status" ON public.appointments;
DROP POLICY IF EXISTS "Allow merchants to manage their inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow merchants to view ledger" ON public.khata_records;
DROP POLICY IF EXISTS "Allow merchants to manage staff" ON public.staff;
DROP POLICY IF EXISTS "Allow merchants to view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow merchants to view leads" ON public.leads;

-- Merchants Policies
CREATE POLICY "Allow public read access to merchant profiles" 
ON public.merchants FOR SELECT USING (true);

CREATE POLICY "Allow merchants to manage their own profile" 
ON public.merchants FOR ALL USING (auth.uid() = user_id);

-- Services Policies
CREATE POLICY "Allow public read access to catalog services" 
ON public.services FOR SELECT USING (true);

CREATE POLICY "Allow merchants to manage their services" 
ON public.services FOR ALL USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
);

-- Appointments Policies
CREATE POLICY "Allow users to view their own appointments" 
ON public.appointments FOR SELECT USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
    OR customer_name = (SELECT COALESCE(full_name, 'Guest') FROM public.merchants WHERE user_id = auth.uid())
);

CREATE POLICY "Allow anyone to request an appointment" 
ON public.appointments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow merchants to update appointment status" 
ON public.appointments FOR UPDATE USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
);

-- Inventory Policies
CREATE POLICY "Allow merchants to manage their inventory" 
ON public.inventory FOR ALL USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
);

-- Khata Ledger Policies
CREATE POLICY "Allow merchants to view ledger" 
ON public.khata_records FOR ALL USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
);

-- Staff Policies
CREATE POLICY "Allow merchants to manage staff" 
ON public.staff FOR ALL USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
);

-- Notifications Policies
CREATE POLICY "Allow merchants to view notifications" 
ON public.notifications FOR ALL USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
);

-- Leads Policies
CREATE POLICY "Allow merchants to view leads" 
ON public.leads FOR ALL USING (
    merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid())
);

-- ==================================================
-- 11. AUTO-UPDATE TIMESTAMP FUNCTION
-- ==================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers before creation to avoid duplicate errors
DROP TRIGGER IF EXISTS update_merchants_updated_at ON public.merchants;
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;

CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON public.merchants
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
