-- Check the current structure of the profiles table
-- Run this first to see what we're working with

-- Check if profiles table exists and its structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what data is in profiles
SELECT * FROM public.profiles LIMIT 10;