# Firebase Phone Authentication Setup - Quick Start

## What's New

Your PocketAce app now uses **Firebase Phone Authentication** for secure SMS verification:

✅ **Real SMS Delivery** - Firebase sends actual SMS codes to phones  
✅ **Device Fingerprinting** - Prevents account farming (1 account per device/24h)  
✅ **reCAPTCHA Protection** - Built-in security against bots  
✅ **Firebase Persistence** - Automatic session management  

## Setup Steps

### 1. Create Firebase Project
Go to https://console.firebase.google.com/ and:
- Create new project called "PocketAce"
- Add a Web app

### 2. Get Your Config
Firebase will show you a config like:
```javascript
{
  apiKey: "AIza...",
  authDomain: "pocketace-xxx.firebaseapp.com",
  projectId: "pocketace-xxx",
  storageBucket: "pocketace-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
}
```

### 3. Create `.env.local` 
In your project root, create a file named `.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=pocketace-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pocketace-xxx
VITE_FIREBASE_STORAGE_BUCKET=pocketace-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

### 4. Enable Phone Authentication
In Firebase Console:
- Go to **Authentication** → **Sign-in methods**
- Enable **Phone** option
- Add your phone number as a test number (for development)

### 5. Test It
```bash
npm run dev
# Opens at http://localhost:5175
```

Try registering with any phone format:
- `0545729770`
- `+972545729770`  
- `+1-234-567-8900`
- etc.

## How It Works Now

**Registration Flow:**
1. User enters Name + Phone
2. Firebase sends SMS code
3. User enters 6-digit code
4. Account created with Name + Phone stored

**Login Flow:**
1. User enters Phone
2. Firebase sends SMS code  
3. User enters 6-digit code
4. Auto-login to existing account

**Security Features:**
- Device fingerprinting blocks rapid account creation
- Rate limiting: 1 new account per device per 24 hours
- reCAPTCHA validates real users
- Phone serves as unique authentication key
- Firebase handles session persistence

## Testing in Development

Test phone numbers (Firebase allows SMS to these during development):
- Add your real phone number in Firebase Console
- Or use Firebase's permanent test numbers:
  - `+1 650-253-0000` (Google's test number)
  - Register test numbers in Authentication → Settings

## Production Deployment

When you deploy to production:

1. Create a new Firebase project for production
2. Update `.env.local` with production credentials
3. Firebase automatically upgrades from test mode to real SMS
4. No code changes needed - it just works!

## File Structure

**New Files:**
- `src/config/firebase.ts` - Firebase initialization
- `src/utils/firebaseAuth.ts` - Phone auth functions
- `.env.local` - Your Firebase credentials (not committed)

**Updated Files:**
- `src/components/Auth.tsx` - Uses Firebase phone auth
- `src/App.tsx` - Uses Firebase auth utilities

**Old Files (Still Available):**
- `src/utils/auth.ts` - Mock SMS system (for fallback/reference)

## Environment Variables

All environment variables are **Vite prefixed** with `VITE_`:

```env
VITE_FIREBASE_API_KEY          # Your Firebase API key
VITE_FIREBASE_AUTH_DOMAIN      # Your Firebase auth domain
VITE_FIREBASE_PROJECT_ID       # Your project ID
VITE_FIREBASE_STORAGE_BUCKET   # Storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID  # Messaging sender ID
VITE_FIREBASE_APP_ID           # App ID
```

## Troubleshooting

**"Cannot read properties of undefined"**
- Make sure `.env.local` has your Firebase credentials
- Restart dev server after updating `.env.local`

**SMS not arriving**
- In development, only SMS to test numbers works
- Add your number to Firebase Console → Authentication → Settings → Test phone numbers
- Production mode sends SMS to any number

**reCAPTCHA errors**
- Make sure Phone auth is enabled in Firebase Console
- Check browser console (F12) for error messages
- Ensure reCAPTCHA keys are auto-configured (they are by default)

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Add `.env.local` with credentials
3. ✅ Test registration/login locally
4. ✅ Verify SMS codes work
5. → Deploy to production when ready

Questions? Check `FIREBASE_SETUP.md` for detailed setup instructions.
