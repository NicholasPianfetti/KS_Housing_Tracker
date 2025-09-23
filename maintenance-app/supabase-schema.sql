-- Housing Tracker Database Schema for Supabase

-- Enable Row Level Security (RLS) by default
ALTER DATABASE postgres SET row_security = on;

-- Create issues table
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

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on row changes
CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on issues table
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all issues
CREATE POLICY "Anyone can view issues" ON public.issues
    FOR SELECT USING (true);

-- Policy: Authenticated users can insert issues
CREATE POLICY "Authenticated users can insert issues" ON public.issues
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update issues they submitted or admins can update any
CREATE POLICY "Users can update their own issues or admins can update any" ON public.issues
    FOR UPDATE USING (
        auth.email() = submitted_by OR
        auth.email() IN ('admin@fraternity.edu', 'maintenance@fraternity.edu')
    );

-- Policy: Users can delete issues they submitted or admins can delete any
CREATE POLICY "Users can delete their own issues or admins can delete any" ON public.issues
    FOR DELETE USING (
        auth.email() = submitted_by OR
        auth.email() IN ('admin@fraternity.edu', 'maintenance@fraternity.edu')
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_issues_date_submitted ON public.issues(date_submitted DESC);
CREATE INDEX IF NOT EXISTS idx_issues_submitted_by ON public.issues(submitted_by);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues(status);

-- Insert sample data (optional - for testing)
INSERT INTO public.issues (title, description, submitted_by, status) VALUES
('Broken HVAC System', 'The heating system in the common area is not working properly. Temperature is too cold.', 'member1@fraternity.edu', 'Pending'),
('Leaky Faucet in Kitchen', 'The kitchen faucet has been leaking for several days. Water is constantly dripping.', 'member2@fraternity.edu', 'In Progress'),
('WiFi Connection Issues', 'Internet connection is very slow in the study room area. Need better coverage.', 'admin@fraternity.edu', 'Completed');