# Supabase Setup Guide for Housing Tracker App

## Overview
This guide will walk you through setting up Supabase for your Housing Tracker web application, including authentication and database functionality.

## Prerequisites
- A web browser
- Access to your project files
- Basic understanding of environment variables

## Step-by-Step Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Click "New Project"
3. Choose your organization and give your project a name (e.g., "housing-tracker")
4. Choose a region closest to your users
5. Set a strong database password and save it securely
6. Click "Create new project"
7. Wait for the project to be created (this may take a few minutes)

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (under "Project API keys")

### 3. Configure Environment Variables

1. In your project root directory (`maintenance-app/`), create a file named `.env.local`
2. Add your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace the placeholder values with your actual Supabase credentials.

### 4. Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of the `supabase-schema.sql` file in your project
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL commands

This will create:
- An `issues` table with the required columns
- Row Level Security (RLS) policies
- Indexes for better performance
- Sample data for testing

### 5. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Scroll down to **Email Auth**
3. Make sure "Enable email confirmations" is **disabled** (for easier testing)
4. You can optionally set up email templates and SMTP later

### 6. Create User Accounts

You have two options for user accounts:

#### Option A: Manual User Creation (Recommended for testing)
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Add users with these emails (these are the authorized emails in the app):
   - `admin@fraternity.edu` (admin user)
   - `maintenance@fraternity.edu` (admin user)
   - `president@fraternity.edu` (regular user)
   - `member1@fraternity.edu` (regular user)
   - `member2@fraternity.edu` (regular user)
4. Set passwords for each user

#### Option B: Enable Sign-ups (Optional)
1. Go to **Authentication** → **Settings**
2. Under "User Signups", enable "Allow new users to sign up"
3. Users can then register themselves, but only authorized emails will have access

### 7. Test Your Setup

1. Restart your development server:
   ```bash
   npm start
   ```

2. The app should now connect to Supabase instead of using local storage
3. Try logging in with one of the authorized email addresses
4. Create, edit, and delete issues to test database functionality
5. Test upvoting/downvoting features

### 8. Verify Database Integration

1. In Supabase dashboard, go to **Database** → **Tables** → **issues**
2. You should see any issues you created in the app
3. Real-time updates should work - try opening the app in two browser windows

## Troubleshooting

### Common Issues

1. **"Supabase not configured" error**
   - Check that your `.env.local` file exists and has the correct variable names
   - Restart your development server after creating the `.env.local` file

2. **Authentication not working**
   - Verify user accounts exist in Supabase Authentication
   - Check that the email addresses match the authorized emails in the app
   - Ensure email confirmation is disabled in Auth settings

3. **Database errors**
   - Verify the SQL schema was executed successfully
   - Check the browser console for specific error messages
   - Ensure RLS policies are properly set up

4. **Real-time updates not working**
   - Check that the Supabase client is properly configured
   - Verify the real-time subscription is set up correctly

### Environment Variables Not Loading
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
- Variable names must start with `REACT_APP_`
- Restart the development server after making changes

## Security Notes

- Never commit your `.env.local` file to version control
- The anon key is safe to use in client-side code as it's protected by RLS policies
- Consider setting up proper email authentication for production use
- Review and customize RLS policies based on your security requirements

## Next Steps

After successful setup:
1. Customize the database schema if needed
2. Set up proper email authentication with SMTP
3. Configure custom authentication flows
4. Set up database backups
5. Consider setting up staging and production environments

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Review the browser console for error messages
3. Check the Supabase dashboard logs
4. Ensure all setup steps were completed correctly