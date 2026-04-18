# Firebase Configuration

## Step 1: Create a Firebase Project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "PocketAce"
4. Click "Create Project"

## Step 2: Add Web App

1. In the Firebase console, click the web icon (</> icon)
2. Register app as "PocketAce Web"
3. Firebase will provide you the config

## Step 3: Copy Your Config

Create a `.env.local` file in the project root with:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Step 4: Enable Phone Authentication

1. In Firebase Console → Authentication → Sign-in method
2. Enable "Phone" sign-in method
3. Add your phone number to testers list for development

## Step 5: Create reCAPTCHA

1. In Firebase Console → Authentication → Settings
2. Under reCAPTCHA keys, create a new web key
3. You now have reCAPTCHA configured automatically

## Testing in Development

- Use test phone numbers from Firebase console
- SMS will only be sent to verified test numbers during development
- You can manage test numbers in Authentication → Settings → Test phone numbers

## Production Deployment

When deploying to production:
1. Create a new Firebase project for production
2. Update `.env.local` with production Firebase config
3. Enable real SMS sending in Firebase Authentication settings
4. Your users will receive real SMS verification codes
