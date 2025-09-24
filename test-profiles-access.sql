-- Test profile access and RLS status
-- Run this to verify profiles table is accessible

-- Check if RLS is enabled on profiles
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check all profiles
SELECT id, email, is_admin FROM public.profiles;

-- Check specific admin users
SELECT id, email, is_admin
FROM public.profiles
WHERE email IN ('admin@fraternity.edu', 'maintenance@fraternity.edu');

-- Test the exact query the app is using (replace with actual UUID)
-- Get a user ID first:
SELECT id, email FROM auth.users LIMIT 1;

-- Then test with that ID (replace YOUR_USER_ID):
-- SELECT is_admin FROM public.profiles WHERE id = 'YOUR_USER_ID';