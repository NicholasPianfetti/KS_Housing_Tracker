-- Fixed database schema for Supabase
-- Run this in SQL Editor to fix the issues table

-- Drop existing table if it has problems
DROP TABLE IF EXISTS public.issues CASCADE;

-- Create issues table with correct structure
CREATE TABLE public.issues (
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

-- Enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies that will work
CREATE POLICY "Enable read access for all users" ON public.issues
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.issues
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all authenticated users" ON public.issues
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all authenticated users" ON public.issues
    FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX idx_issues_date_submitted ON public.issues(date_submitted DESC);
CREATE INDEX idx_issues_submitted_by ON public.issues(submitted_by);
CREATE INDEX idx_issues_status ON public.issues(status);

-- Insert sample data
INSERT INTO public.issues (title, description, submitted_by, status) VALUES
('Broken HVAC System', 'The heating system in the common area is not working properly. Temperature is too cold.', 'member1@fraternity.edu', 'Pending'),
('Leaky Faucet in Kitchen', 'The kitchen faucet has been leaking for several days. Water is constantly dripping.', 'member2@fraternity.edu', 'In Progress'),
('WiFi Connection Issues', 'Internet connection is very slow in the study room area. Need better coverage.', 'admin@fraternity.edu', 'Completed');

-- Test the table
SELECT * FROM public.issues;