-- Alternative method: Create users directly via SQL
-- Run these commands one by one in the Supabase SQL Editor

-- Method 1: Use Supabase's auth.users table directly (if accessible)
-- Note: This might not work on all Supabase instances due to security restrictions

-- Method 2: Enable signups temporarily and create via API
-- First, let's check if we can access the auth schema:
SELECT * FROM auth.users LIMIT 1;

-- If the above works, you can create users like this:
-- Replace 'password123' with actual passwords

-- Create admin user
SELECT auth.signup('admin@fraternity.edu', 'password123');

-- Create maintenance user
SELECT auth.signup('maintenance@fraternity.edu', 'password123');

-- Create member users
SELECT auth.signup('member1@fraternity.edu', 'password123');
SELECT auth.signup('member2@fraternity.edu', 'password123');
SELECT auth.signup('president@fraternity.edu', 'password123');

-- If the auth.signup function doesn't exist, try this approach:
-- (This creates users but they may need email confirmation)

-- Alternative: Insert directly (use with caution)
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   recovery_sent_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'admin@fraternity.edu',
--   crypt('password123', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '{"provider":"email","providers":["email"]}',
--   '{}',
--   now(),
--   now(),
--   '',
--   '',
--   '',
--   ''
-- );