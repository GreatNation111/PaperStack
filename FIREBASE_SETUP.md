# Firebase Setup Instructions

## Overview
Your PaperStack application requires Firebase configuration for authentication, Firestore database, and storage. Follow these steps to complete the setup.

## Prerequisites
- Firebase project already created
- `VITE_FIREBASE_*` environment variables set up in `.env.local`
- Authorized domains configured for Google Sign-In

## Step 1: Configure Firestore Security Rules

The permission errors you're seeing are because the Firestore security rules need to be deployed. **IMPORTANT:** The rules must allow authenticated users to write to `departments`, `courses`, `papers`, and `contributors` collections for the seed script to work.

### How to Deploy Rules:

1. **Using Firebase Console (Easiest):**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Firestore Database** → **Rules** tab
   - Delete the default rules
   - Copy the rules from `firestore.rules` file in this project
   - Click **Publish**

2. **Using Firebase CLI (Recommended):**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

### Critical: Update Rules After Seeding

After running the seed script, you should update the Firestore rules to be more restrictive:
- Remove write permissions from public users for `departments`, `courses`, and `contributors`
- Keep authenticated users able to write to `papers` (for contributions)

**Production Rules** (after seeding):
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /departments/{document=**} {
      allow read: if true;
      allow write: if false; // Disable writes in production
    }
    match /courses/{document=**} {
      allow read: if true;
      allow write: if false; // Disable writes in production
    }
    match /papers/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users
    }
    // ... rest of rules ...
  }
}
```

### What These Rules Allow:
- ✅ Public read: departments, courses, papers, contributors
- ✅ Authenticated write: can seed data and write papers
- ✅ Authenticated read/write: user data, bookmarks, recent courses, notifications

## Step 2: Configure Authorized Domains

Google Sign-In requires you to whitelist your domains.

### How to Add Domains:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** tab
4. Scroll down to **Authorized Domains**
5. Add these domains:
   - `localhost:5173` (for local development)
   - `papers-stack.vercel.app` (for production - adjust to your actual domain)
   - Any other deployment domains you use

6. Click **Add** for each domain
7. Save changes

## Step 3: Initialize Firestore Database

If you haven't created the Firestore database yet:

1. Go to **Firestore Database** in Firebase Console
2. Click **Create Database**
3. Choose region (closest to your users)
4. Start in **Test Mode** for development, then switch to **Production** with the rules from Step 1

## Step 4: Seed Development Data

Once Firestore rules are deployed:

1. Start your dev server: `npm run dev`
2. Navigate to `/seed` route
3. Click **"Run Seed Script"** to populate test data
4. Verify data appears in Firebase Console under Firestore > Collections

## Troubleshooting

### "Missing or insufficient permissions" Error
- ❌ Firestore rules haven't been deployed yet
- ✅ **Solution:** Follow Step 1 above

### "auth/unauthorized-domain" Error
- ❌ Your development or production domain isn't whitelisted
- ✅ **Solution:** Follow Step 2 above and make sure the exact domain matches

### Collections not showing in Firebase
- ❌ Data hasn't been seeded yet
- ✅ **Solution:** Make sure Firestore rules are deployed first, then use `/seed` route

### Changes to rules don't take effect
- ❌ Firebase may be caching rules
- ✅ **Solution:** Wait 5-10 minutes, clear browser cache, or try incognito mode

## Environment Variables

Make sure `.env.local` has all Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Next Steps

After completing all steps:
1. Refresh your browser
2. You should no longer see "Missing or insufficient permissions" errors
3. Recent courses will load properly
4. Notifications will work
5. Bookmarks will sync across devices

## Questions?

Check the browser console for specific error messages. Firebase errors usually indicate:
- Permission issues → Check rules
- Auth issues → Check authorized domains
- Missing data → Check collections exist in Firebase Console
