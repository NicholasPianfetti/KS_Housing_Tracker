-- Debug queries to check Supabase setup
-- Run these one by one in the Supabase SQL Editor

-- 1. Check if issues table exists
SELECT * FROM information_schema.tables WHERE table_name = 'issues';

-- 2. Check table structure
\d public.issues;

-- 3. Check if table has any data
SELECT COUNT(*) FROM public.issues;

-- 4. Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'issues';

-- 5. Test a simple insert (replace with actual user email)
INSERT INTO public.issues (title, description, submitted_by, date_submitted, upvotes, status)
VALUES ('Test Issue', 'Test Description', 'admin@fraternity.edu', NOW(), '{}', 'Pending');

-- 6. Check what's in the table
SELECT * FROM public.issues;