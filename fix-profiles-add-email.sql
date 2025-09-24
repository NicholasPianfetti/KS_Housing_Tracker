-- Fix profiles table by adding missing email column
-- Run this in Supabase SQL Editor

-- Add email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Update email column with values from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Make email NOT NULL after populating it
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_email_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    END IF;
END $$;

-- Update admin users
UPDATE public.profiles
SET is_admin = TRUE
WHERE email IN ('admin@fraternity.edu', 'maintenance@fraternity.edu');

-- Verify the fix
SELECT id, email, is_admin FROM public.profiles;