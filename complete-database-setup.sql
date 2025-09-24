-- Complete Database Setup for Housing Tracker
-- Run this entire script in the Supabase SQL Editor to fix all authentication issues

-- ============================================
-- STEP 1: Create trigger function (if not exists)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create policies for profiles table
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 3: Create function to auto-create profiles
-- ============================================
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Create/Fix issues table
-- ============================================
CREATE TABLE IF NOT EXISTS public.issues (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    date_submitted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    upvotes TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on issues
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.issues;
DROP POLICY IF EXISTS "Authenticated users can insert issues" ON public.issues;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.issues;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.issues;
DROP POLICY IF EXISTS "Users can update their own issues or admins can update any" ON public.issues;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.issues;
DROP POLICY IF EXISTS "Enable update for all authenticated users" ON public.issues;
DROP POLICY IF EXISTS "Users can delete their own issues or admins can delete any" ON public.issues;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.issues;
DROP POLICY IF EXISTS "Enable delete for all authenticated users" ON public.issues;

-- Create new policies for issues table
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

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_issues_updated_at ON public.issues;
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_date_submitted ON public.issues(date_submitted DESC);
CREATE INDEX IF NOT EXISTS idx_issues_submitted_by ON public.issues(submitted_by);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);

-- ============================================
-- STEP 5: Create profiles for existing users
-- ============================================
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, FALSE
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 6: Set admin users
-- ============================================
-- Update these emails to match your actual admin users
UPDATE public.profiles
SET is_admin = TRUE
WHERE email IN ('admin@fraternity.edu', 'maintenance@fraternity.edu');

-- ============================================
-- STEP 7: Insert sample data (optional)
-- ============================================
INSERT INTO public.issues (title, description, submitted_by, status)
VALUES
('Broken HVAC System', 'The heating system in the common area is not working properly. Temperature is too cold.', 'member1@fraternity.edu', 'Pending'),
('Leaky Faucet in Kitchen', 'The kitchen faucet has been leaking for several days. Water is constantly dripping.', 'member2@fraternity.edu', 'In Progress'),
('WiFi Connection Issues', 'Internet connection is very slow in the study room area. Need better coverage.', 'admin@fraternity.edu', 'Fixed')
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 8: Verify setup
-- ============================================
SELECT 'Profiles created:' as status, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Admin users:', COUNT(*) FROM public.profiles WHERE is_admin = TRUE
UNION ALL
SELECT 'Issues created:', COUNT(*) FROM public.issues;

-- Show profiles
SELECT id, email, is_admin FROM public.profiles;