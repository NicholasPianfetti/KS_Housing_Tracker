-- Setup Admin Privileges in Database
-- Run this in Supabase SQL Editor to configure admin users

-- First, check if profiles exist for all users
SELECT 'Users without profiles:' as info;
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Create profiles for any users missing them
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, FALSE
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Set admin privileges for specific users
UPDATE public.profiles
SET is_admin = TRUE
WHERE email IN ('admin@fraternity.edu', 'maintenance@fraternity.edu');

-- Verify the setup
SELECT 'All profiles:' as info;
SELECT id, email, is_admin, created_at
FROM public.profiles
ORDER BY is_admin DESC, email;

-- Check admin count
SELECT 'Admin users count:' as info, COUNT(*) as count
FROM public.profiles
WHERE is_admin = TRUE;