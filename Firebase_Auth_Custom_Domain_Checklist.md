# Firebase Auth Custom Domain Checklist

Goal: stop Google/Firebase sign-in from showing `paperstack-96201.firebaseapp.com` and make it use a branded PaperStack auth domain instead.

## What You Need

You do not need to buy a new domain if you already own:

```txt
paperstack.com.ng
```

Use a free subdomain:

```txt
auth.paperstack.com.ng
```

Recommended setup:

```txt
Main app: https://paperstack.com.ng
Firebase auth helper: https://auth.paperstack.com.ng
```

## Why This Happens

Firebase Auth uses the `authDomain` value in the Firebase config to host its OAuth helper page.

Current behavior looks like:

```txt
https://paperstack-96201.firebaseapp.com/__/auth/handler...
```

After the custom domain setup, it should look like:

```txt
https://auth.paperstack.com.ng/__/auth/handler...
```

Firebase still needs an auth handler page, but it can be on your branded domain.

## Checklist

### 1. Create The Subdomain In DNS

Go to wherever `paperstack.com.ng` DNS is managed and create:

```txt
auth.paperstack.com.ng
```

Point it to Firebase Hosting using the DNS records Firebase gives you during custom domain setup.

### 2. Add Custom Domain In Firebase Hosting

In Firebase Console:

```txt
Firebase Console -> Hosting -> Add custom domain
```

Add:

```txt
auth.paperstack.com.ng
```

Follow Firebase's verification and DNS instructions until the domain is connected.

### 3. Add Authorized Domains In Firebase Auth

In Firebase Console:

```txt
Authentication -> Settings -> Authorized domains
```

Make sure these are listed:

```txt
paperstack.com.ng
auth.paperstack.com.ng
localhost
```

Keep `localhost` so local development still works.

### 4. Update Google OAuth Client

In Google Cloud Console, open the OAuth client used by Firebase Auth.

Add this to **Authorized JavaScript origins**:

```txt
https://auth.paperstack.com.ng
```

Add this to **Authorized redirect URIs**:

```txt
https://auth.paperstack.com.ng/__/auth/handler
```

### 5. Update Firebase Config In The App

Find the Firebase config in the project, likely around:

```txt
src/lib/firebase.ts
```

Change:

```ts
authDomain: "paperstack-96201.firebaseapp.com"
```

to:

```ts
authDomain: "auth.paperstack.com.ng"
```

### 6. Build And Deploy

Run:

```powershell
npm.cmd run build
```

Then deploy the app normally.

If Firebase rules/indexes also need deployment, run:

```powershell
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 7. Test

Test these flows:

- Sign up with Google.
- Sign in with Google.
- Test on local dev.
- Test on the live domain.
- Confirm the popup/redirect uses `auth.paperstack.com.ng`, not `paperstack-96201.firebaseapp.com`.

## Notes

- This does not remove Firebase Auth. It only makes the visible auth helper domain branded.
- The main app can stay hosted wherever it currently is, including Vercel.
- The auth helper domain can be Firebase Hosting while the app is hosted elsewhere.
- Do not delete `paperstack-96201.firebaseapp.com` from Firebase internals. Just stop using it as the public `authDomain`.

