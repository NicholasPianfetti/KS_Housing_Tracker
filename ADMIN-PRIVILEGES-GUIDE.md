# Admin Privileges Guide

## How Admin Privileges Work

Admin privileges are now **100% database-driven** through Supabase. No hardcoded values.

## Setting Admin Users

### Method 1: SQL (Recommended)
Run this in Supabase SQL Editor:

```sql
-- Set a user as admin
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'user@example.com';

-- Remove admin privileges
UPDATE public.profiles
SET is_admin = FALSE
WHERE email = 'user@example.com';

-- View all admin users
SELECT id, email, is_admin
FROM public.profiles
WHERE is_admin = TRUE;
```

### Method 2: Supabase Dashboard
1. Go to **Table Editor** → **profiles**
2. Find the user row
3. Edit the `is_admin` column to `true` or `false`
4. Save

## How It Works in Code

1. **User logs in** → Supabase authenticates
2. **Auth state changes** → App queries `profiles` table for `is_admin` flag
3. **Admin status set** → UI shows/hides admin features based on database value

### Key Code Location
- `src/contexts/AuthContext.tsx` - `checkAdminStatus()` function queries profiles table
- No fallback to hardcoded values
- If profile query fails, user is treated as non-admin (safe default)

## Creating New Users

### Step 1: Create User Account
**In Supabase Dashboard → Authentication → Users:**
- Click "Add User"
- Enter email and password
- User is created

### Step 2: Profile Auto-Created
A trigger automatically creates a profile with `is_admin = FALSE`

### Step 3: Set Admin (if needed)
Run SQL:
```sql
UPDATE public.profiles
SET is_admin = TRUE
WHERE email = 'newuser@example.com';
```

## Troubleshooting

### User shows as non-admin but should be admin
1. Check profiles table: `SELECT * FROM profiles WHERE email = 'user@example.com'`
2. Verify `is_admin = TRUE`
3. User needs to log out and log back in for change to take effect

### New user has no profile
Run:
```sql
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, FALSE
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

### Profile query errors in console
- Check if profiles table exists
- Verify RLS policies allow SELECT for authenticated users
- Ensure trigger `on_auth_user_created` is active

## Admin Features in App

When `is_admin = TRUE`, users can:
- Edit any issue (title, description, status)
- Delete any issue
- See "Admin View" badge in header

When `is_admin = FALSE`, users can:
- Create issues
- Upvote/downvote issues
- Edit/delete only their own issues

## Production Deployment

Before deploying:
1. ✅ Verify all admin users are set in profiles table
2. ✅ Test admin login works
3. ✅ Test non-admin login works
4. ✅ Remove any test users
5. ✅ Backup profiles table

No code changes needed - everything is database-driven!