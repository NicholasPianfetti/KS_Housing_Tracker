# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A fraternity maintenance request portal built with React + TypeScript. Users can submit, vote on, and track maintenance issues. Features dual-mode operation: Supabase (production) or localStorage (local development/demo).

## Commands

### Development
```bash
npm start              # Start dev server (localhost:3000)
npm test              # Run tests with Jest/React Testing Library
npm run build         # Production build
```

### Deployment
```bash
npm run predeploy     # Build for deployment
npm run deploy        # Deploy to GitHub Pages
```

## Architecture

### Dual-Mode Operation
The app automatically switches between Supabase and localStorage based on environment variables:
- **Supabase mode**: Full backend with auth and real-time updates (requires `REACT_APP_SUPABASE_URL` + `REACT_APP_SUPABASE_ANON_KEY`)
- **localStorage mode**: Demo mode with mock auth (password: "demo123") - see `src/services/localStorageService.ts`

### Context Architecture
Two main React contexts provide global state:

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Handles authentication in both Supabase and localStorage modes
   - Manages admin privileges (checks `profiles.is_admin` table in Supabase, hardcoded email check in localStorage)
   - Authorized emails defined in `AUTHORIZED_EMAILS` constant
   - Admin detection differs by mode:
     - Supabase: Queries `profiles` table for `is_admin` flag
     - localStorage: Checks if email === 'admin@fraternity.edu'

2. **IssuesContext** (`src/contexts/IssuesContext.tsx`)
   - CRUD operations for maintenance issues
   - Real-time subscriptions in Supabase mode
   - Voting system (upvotes stored as email array)
   - Auto-switches storage backend based on `isUsingLocalStorage` flag

### Data Model
See `src/types/index.ts` for TypeScript interfaces:
- **Issue**: id, title, description, submittedBy, dateSubmitted, upvotes (string[]), status
- Status values: 'Pending' | 'In Progress' | 'Fixed'

### Database (Supabase)
- **issues table**: Main issue tracking with RLS policies
- **profiles table**: User metadata with `is_admin` flag (referenced as `users` in some SQL files)
- Schema files:
  - `supabase-schema.sql`: Issues table + RLS policies
  - `setup-users-table.sql`: Profiles/users table + admin policies
- Admin privileges verified via email hardcoded in RLS policies AND profiles table

### Key Components
- `Login.tsx`: Handles both Supabase and localStorage auth flows
- `Dashboard.tsx`: Main issue list view
- `IssueCard.tsx`: Individual issue display with voting
- `CreateIssueModal.tsx` / `EditIssueModal.tsx`: Issue forms
- `ProtectedRoute.tsx`: Auth guard wrapper
- `TempSignup.tsx`: Manual user registration component

## Configuration

### Environment Variables (.env.local)
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Authorized Users
Update `AUTHORIZED_EMAILS` in `src/contexts/AuthContext.tsx` to control access. Admin users determined by:
- localStorage mode: Hardcoded check for 'admin@fraternity.edu'
- Supabase mode: Database `profiles.is_admin` flag

### Styling
- Tailwind CSS configured via `tailwind.config.js` and `postcss.config.js`
- Global styles in `src/index.css`

## Development Notes

- The app has **NO routing** - conditional rendering based on auth state in `App.tsx`
- Real-time updates only work in Supabase mode (uses Supabase channels)
- localStorage mode useful for quick testing without backend setup
- When adding features, respect the dual-mode pattern: implement for both storage backends
- Admin RLS policies reference specific emails ('admin@fraternity.edu', 'maintenance@fraternity.edu') - update in both code and SQL files when changing admin users