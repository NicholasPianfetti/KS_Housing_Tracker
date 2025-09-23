# Fraternity Maintenance Request Portal

A web application for managing maintenance requests in a fraternity house with user authentication, voting system, and admin controls.

## Features

### User Mode
- **Submit Issues**: Users can report maintenance issues with title and detailed description
- **Upvote System**: Each user can upvote issues they think are most important (one vote per issue)
- **View Issues**: All issues are displayed sorted by number of upvotes (most important first)
- **Real-time Updates**: Issues update in real-time as others submit or vote

### Admin Mode
- **Edit Issues**: Admins can modify issue titles and descriptions
- **Status Management**: Tag issues as "Pending", "In Progress", or "Fixed"
- **Delete Issues**: Remove inappropriate or duplicate submissions
- **Full Visibility**: See all user actions and manage the system

### Authentication & Security
- **Firebase Authentication**: Secure login system
- **Email Whitelisting**: Only approved fraternity emails can access the system
- **Role-based Access**: Separate admin and user permissions
- **No Public Signup**: Prevents unauthorized access

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Hosting**: Can be deployed to Firebase Hosting, Vercel, or any static host

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** with Email/Password provider
4. Enable **Cloud Firestore** database
5. Get your Firebase configuration from Project Settings > General > Your apps

### 2. Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration:

```bash
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 3. Configure User Access

Edit `src/contexts/AuthContext.tsx` to update the email lists:

```typescript
const AUTHORIZED_EMAILS = [
  'admin@fraternity.edu',
  'maintenance@fraternity.edu',
  'president@fraternity.edu',
  'member1@fraternity.edu',
  'member2@fraternity.edu',
  // Add your fraternity members' emails here
];

const ADMIN_EMAILS = [
  'admin@fraternity.edu',
  'maintenance@fraternity.edu',
  // Add admin emails here
];
```

### 4. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### 5. Create User Accounts

Since public signup is disabled, you'll need to manually create accounts:

1. Temporarily enable email/password signup in Firebase Console
2. Create accounts for your whitelisted users
3. Disable signup again for security

## Usage

### For Users
1. Sign in with your whitelisted fraternity email
2. View existing issues on the dashboard
3. Click "Report New Issue" to submit a maintenance request
4. Click the thumbs up button to upvote important issues
5. Issues are automatically sorted by popularity

### For Admins
1. Sign in with an admin email address
2. See "Admin" badge in the header
3. Use "Edit" button on any issue to modify content or status
4. Use "Delete" button to remove issues
5. Update status to track progress (Pending → In Progress → Fixed)

## Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Issues collection
    match /issues/{issueId} {
      // Allow read for authenticated users
      allow read: if request.auth != null;

      // Allow create for authenticated users
      allow create: if request.auth != null
        && request.auth.token.email in [
          "admin@fraternity.edu",
          "maintenance@fraternity.edu",
          "president@fraternity.edu",
          "member1@fraternity.edu",
          "member2@fraternity.edu"
        ];

      // Allow update/delete for admin users only
      allow update, delete: if request.auth != null
        && request.auth.token.email in [
          "admin@fraternity.edu",
          "maintenance@fraternity.edu"
        ];
    }
  }
}
```

## Deployment

### Firebase Hosting
```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Vercel
```bash
npm run build
npx vercel --prod
```

## Customization

- **Email Lists**: Update authorized and admin emails in `AuthContext.tsx`
- **Styling**: Modify Tailwind classes throughout the components
- **Features**: Add new issue fields, categories, or notification systems
- **Branding**: Update colors, logos, and text to match your fraternity

## Security Notes

- Never commit your `.env.local` file to version control
- Regularly review the authorized email lists
- Monitor Firebase usage and security in the console
- Consider implementing email verification for additional security

## Support

For issues or questions, contact your system administrator or create an issue in this repository.
