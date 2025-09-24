-- Verify Database Setup and Create Test User
-- Run this to check your current setup and create a test user if needed

-- ============================================
-- STEP 1: Check what users exist
-- ============================================
SELECT 'Checking auth users:' as info;
SELECT id, email, created_at FROM auth.users;

-- ============================================
-- STEP 2: Check profiles
-- ============================================
SELECT 'Checking profiles:' as info;
SELECT id, email, is_admin FROM public.profiles;

-- ============================================
-- STEP 3: Check issues
-- ============================================
SELECT 'Checking issues:' as info;
SELECT id, title, submitted_by, status FROM public.issues;

-- ============================================
-- STEP 4: Check RLS policies
-- ============================================
SELECT 'Checking RLS policies on profiles:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

SELECT 'Checking RLS policies on issues:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'issues';