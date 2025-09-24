# Authentication Fix Instructions

## What Was Wrong

Your app was timing out because:
1. The `profiles` table query was failing silently when a user's profile didn't exist
2. Errors weren't being logged, making it impossible to debug
3. The 3-second timeout was triggered because `setLoading(false)` never executed

## What I Fixed

✅ Added proper error logging to both profile queries in `AuthContext.tsx`
✅ Now errors will show in console so you can see what's failing

## Next Steps - Do These In Order:

### 1. Verify Your Database Setup

Run `verify-and-test.sql` in Supabase SQL Editor to check:
- If you have any users in auth.users
- If profiles table exists and has data
- If issues table has data
- If RLS policies are set up correctly

### 2. Create Test Users (If Needed)

If you don't have any users, go to:
**Supabase Dashboard → Authentication → Users → Add User**

Create these test accounts:
- `admin@fraternity.edu` (password: anything you want)
- `member1@fraternity.edu` (password: anything you want)

### 3. Ensure Profiles Are Created

After creating users, the trigger should auto-create profiles. Verify by running:
```sql
SELECT id, email, is_admin FROM public.profiles;
```

If profiles are missing, run:
```sql
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, FALSE
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Then set admins
UPDATE public.profiles
SET is_admin = TRUE
WHERE email IN ('admin@fraternity.edu', 'maintenance@fraternity.edu');
```

### 4. Test Your App

1. Refresh your web app
2. Check the browser console - you should now see detailed error messages
3. Try logging in with one of your test users
4. Check console for any profile errors

### 5. Common Issues & Fixes

**Issue: "Error fetching profile: Row not found"**
- Run the INSERT query from step 3 to create missing profiles

**Issue: "Error fetching issues"**
- Check RLS policies with `verify-and-test.sql`
- Issues table might be empty - create test issues in Supabase dashboard

**Issue: Still showing "Loading..."**
- Clear browser cache and hard refresh (Ctrl + Shift + R)
- Check if Supabase URL/Key are correct in `.env.local`

## Quick Debug Commands

Run these in browser console to debug:
```javascript
// Check current environment
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL)

// Check if using local storage
localStorage.getItem('currentUser')
```

## If All Else Fails

Run `COMPLETE-FIX.sql` again - it will completely reset your database tables and should fix everything.