-- COMPLETE FIX for Authentication Issues
-- This script will fix your profiles table regardless of its current state
-- Run this ENTIRE script in Supabase SQL Editor

-- ============================================
-- STEP 1: Drop and recreate profiles table cleanly
-- ============================================

-- Drop existing triggers and functions related to profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop the profiles table completely
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with correct structure
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Create policies for profiles
-- ============================================

CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- STEP 3: Create trigger functions
-- ============================================

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, is_admin)
    VALUES (NEW.id, NEW.email, FALSE)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Create profiles for existing users
-- ============================================

INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, FALSE
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: Set admin privileges
-- ============================================

UPDATE public.profiles
SET is_admin = TRUE
WHERE email IN ('admin@fraternity.edu', 'maintenance@fraternity.edu');

-- ============================================
-- STEP 6: Fix issues table RLS policies
-- ============================================

-- Drop all existing policies on issues table
DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.issues;
DROP POLICY IF EXISTS "Authenticated users can insert issues" ON public.issues;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.issues;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.issues;
DROP POLICY IF EXISTS "Users can update their own issues or admins can update any" ON public.issues;
DROP POLICY IF EXISTS "Users can update own issues or admins can update any" ON public.issues;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.issues;
DROP POLICY IF EXISTS "Enable update for all authenticated users" ON public.issues;
DROP POLICY IF EXISTS "Users can delete their own issues or admins can delete any" ON public.issues;
DROP POLICY IF EXISTS "Users can delete own issues or admins can delete any" ON public.issues;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.issues;
DROP POLICY IF EXISTS "Enable delete for all authenticated users" ON public.issues;

-- Create new policies that use profiles table
CREATE POLICY "Anyone can view issues" ON public.issues
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert issues" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own issues or admins can update any" ON public.issues
    FOR UPDATE USING (
        auth.email() = submitted_by OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Users can delete own issues or admins can delete any" ON public.issues
    FOR DELETE USING (
        auth.email() = submitted_by OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ============================================
-- STEP 7: Verify everything is set up correctly
-- ============================================

SELECT 'Setup Complete!' as status;
SELECT 'Total profiles:' as info, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Admin users:', COUNT(*) FROM public.profiles WHERE is_admin = TRUE
UNION ALL
SELECT 'Total issues:', COUNT(*) FROM public.issues;

-- Show all profiles
SELECT id, email, is_admin, created_at FROM public.profiles ORDER BY is_admin DESC, email;