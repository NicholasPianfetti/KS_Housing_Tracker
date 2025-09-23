-- Fix for Supabase user creation issues
-- Run this in the SQL Editor to fix authentication problems

-- First, let's check if there are any conflicting policies
DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;
DROP POLICY IF EXISTS "Authenticated users can insert issues" ON public.issues;
DROP POLICY IF EXISTS "Users can update their own issues or admins can update any" ON public.issues;
DROP POLICY IF EXISTS "Users can delete their own issues or admins can delete any" ON public.issues;

-- Temporarily disable RLS to allow user creation
ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create simpler, more permissive policies for testing
CREATE POLICY "Enable read access for all users" ON public.issues
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.issues
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on email" ON public.issues
    FOR UPDATE USING (auth.email() = submitted_by OR auth.email() IN ('admin@fraternity.edu', 'maintenance@fraternity.edu'));

CREATE POLICY "Enable delete for users based on email" ON public.issues
    FOR DELETE USING (auth.email() = submitted_by OR auth.email() IN ('admin@fraternity.edu', 'maintenance@fraternity.edu'));

-- Alternative: If you're still having issues, you can temporarily make the table completely open:
-- ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;