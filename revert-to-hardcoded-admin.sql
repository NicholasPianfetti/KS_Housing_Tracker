-- Revert RLS policies to use hardcoded admin emails
-- Run this in Supabase SQL Editor

-- Drop existing policies on issues table
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

-- Create simple policies with hardcoded admin emails
CREATE POLICY "Anyone can view issues" ON public.issues
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert issues" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own issues or admins can update any" ON public.issues
    FOR UPDATE USING (
        auth.email() = submitted_by OR
        auth.email() IN ('admin@fraternity.edu', 'maintenance@fraternity.edu')
    );

CREATE POLICY "Users can delete own issues or admins can delete any" ON public.issues
    FOR DELETE USING (
        auth.email() = submitted_by OR
        auth.email() IN ('admin@fraternity.edu', 'maintenance@fraternity.edu')
    );

-- Verify policies
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'issues';