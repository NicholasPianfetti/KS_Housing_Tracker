-- Create users table to store user metadata including admin status
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own record
CREATE POLICY "Users can view their own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can view all users (needed for app functionality)
CREATE POLICY "Authenticated users can view all users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admins can update user records
CREATE POLICY "Only admins can update users" ON public.users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, is_admin)
    VALUES (NEW.id, NEW.email, FALSE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update the RLS policies in issues table to use users.is_admin
DROP POLICY IF EXISTS "Users can update their own issues or admins can update any" ON public.issues;
DROP POLICY IF EXISTS "Users can delete their own issues or admins can delete any" ON public.issues;

CREATE POLICY "Users can update their own issues or admins can update any" ON public.issues
    FOR UPDATE USING (
        auth.email() = submitted_by OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Users can delete their own issues or admins can delete any" ON public.issues
    FOR DELETE USING (
        auth.email() = submitted_by OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Insert initial admin user (replace with your actual admin email)
-- Note: This will only work for users that already exist in auth.users
-- For new users, they will be created with is_admin = FALSE by default
-- You'll need to manually update them to admin after signup

-- Example: Update existing user to admin (uncomment and modify email as needed)
-- UPDATE public.users SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';