# Supabase Magic Link Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock phone/localStorage auth with real Supabase magic link email authentication, removing phone entirely from the data model and UI.

**Architecture:** Supabase JS SDK manages auth sessions via JWT. `App.tsx` subscribes to `onAuthStateChange` to drive phase transitions instead of reading localStorage synchronously on boot. `Auth.tsx` collects email (+ name for registration) and calls `supabase.auth.signInWithOtp`; the SDK auto-detects the magic link token on redirect and fires `SIGNED_IN`.

**Tech Stack:** `@supabase/supabase-js` v2, React 19, TypeScript strict, Vite

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/config/supabase.ts` | Create | Supabase singleton client |
| `src/config/firebase.ts` | Delete | Removed entirely |
| `src/types.ts` | Modify | `User.phone` → `User.email` |
| `src/utils/auth.ts` | Rewrite | `sendMagicLink`, `signOut`, `sessionToUser` |
| `src/components/Auth.tsx` | Rewrite | Email input + "check inbox" screen, no `onAuthSuccess` prop |
| `src/App.tsx` | Modify | Async boot via `getSession` + `onAuthStateChange` subscription; remove `handleAuthSuccess` |
| `.env.local` | Modify | Swap Firebase vars for Supabase vars |
| `package.json` | Modify | Remove `firebase`, add `@supabase/supabase-js` |

---

## Task 1: Swap dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Uninstall Firebase**

```bash
npm uninstall firebase
```

Expected: `firebase` removed from `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Install Supabase JS SDK**

```bash
npm install @supabase/supabase-js
```

Expected: `@supabase/supabase-js` appears in `package.json` dependencies.

- [ ] **Step 3: Verify lint (firebase import will error — expected)**

```bash
npm run lint 2>&1 | head -20
```

Expected: errors about `firebase` imports in `src/config/firebase.ts` and possibly `src/utils/auth.ts`. This is fine — we'll fix them in subsequent tasks.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap firebase for @supabase/supabase-js"
```

---

## Task 2: Create Supabase client + update env

**Files:**
- Create: `src/config/supabase.ts`
- Modify: `.env.local`

- [ ] **Step 1: Get credentials from Supabase dashboard**

Go to your Supabase project → Settings → API. Copy:
- **Project URL** (looks like `https://xxxx.supabase.co`)
- **anon/public key** (long JWT string)

Also go to Authentication → URL Configuration and add these to **Redirect URLs**:
- `http://localhost:5173`
- Your production URL (if deployed)

- [ ] **Step 2: Replace `.env.local` contents**

Replace the entire file with:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

(Keep no Firebase vars — they are removed entirely.)

- [ ] **Step 3: Create `src/config/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 4: Lint the new file**

```bash
npm run lint -- src/config/supabase.ts
```

Expected: no errors on this file.

- [ ] **Step 5: Commit**

```bash
git add src/config/supabase.ts .env.local
git commit -m "feat: add Supabase client config"
```

---

## Task 3: Update User type

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Replace `phone` with `email` in the User interface**

In `src/types.ts`, change:

```typescript
export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
}
```

to:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}
```

- [ ] **Step 2: Run lint to see what breaks**

```bash
npm run lint 2>&1 | grep -v "^$"
```

Expected: errors in `src/utils/auth.ts` and `src/components/Auth.tsx` referencing `.phone`. This is expected — we fix those in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "refactor: replace User.phone with User.email in types"
```

---

## Task 4: Rewrite auth.ts

**Files:**
- Rewrite: `src/utils/auth.ts`

- [ ] **Step 1: Replace the entire contents of `src/utils/auth.ts`**

```typescript
import { supabase } from '../config/supabase';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

export const sessionToUser = (session: Session): User => ({
  id: session.user.id,
  name: (session.user.user_metadata?.name as string) || '',
  email: session.user.email || '',
  createdAt: new Date(session.user.created_at).getTime(),
});

export const sendMagicLink = async (
  email: string,
  name?: string
): Promise<{ error?: string }> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
      ...(name?.trim() ? { data: { name: name.trim() } } : {}),
    },
  });
  return error ? { error: error.message } : {};
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};
```

- [ ] **Step 2: Run lint**

```bash
npm run lint -- src/utils/auth.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/auth.ts
git commit -m "feat: rewrite auth.ts with Supabase magic link"
```

---

## Task 5: Update App.tsx

**Files:**
- Modify: `src/App.tsx`

The boot logic changes from a synchronous localStorage read to an async `getSession` call + `onAuthStateChange` subscription. `handleAuthSuccess` is removed since `onAuthStateChange` handles the SIGNED_IN transition directly. `handleLogout` becomes async.

- [ ] **Step 1: Update imports at the top of `src/App.tsx`**

Replace:
```typescript
import { getCurrentUser, logoutUser } from './utils/auth';
```

with:
```typescript
import { sessionToUser, signOut } from './utils/auth';
import { supabase } from './config/supabase';
```

- [ ] **Step 2: Replace the boot `useEffect` (lines 36–65)**

Replace:
```typescript
useEffect(() => {
  const user = getCurrentUser();
  if (!user) return;
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setCurrentUser(user);

  initializePurchases(user.id).then(() => {
    checkPremiumStatus().then(premium => {
      if (premium) {
        setIsPremium(true);
        localStorage.setItem('pocketAce_isPremium', 'true');
      }
    });
  });

  try {
    const saved = localStorage.getItem(GAME_SAVE_KEY);
    if (saved) {
      const { phase: savedPhase, players: savedPlayers, settings: savedSettings } = JSON.parse(saved);
      if (savedPlayers?.length > 0) {
        setPlayers(savedPlayers);
        setSettings(savedSettings);
        setPhase(savedPhase);
        return;
      }
    }
  } catch { /* fall through to lobby */ }

  setPhase(GamePhaseEnum.LOBBY);
}, []);
```

with:
```typescript
useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!mounted || !session) return;
    const user = sessionToUser(session);
    setCurrentUser(user);

    initializePurchases(user.id).then(() => {
      checkPremiumStatus().then(premium => {
        if (premium && mounted) {
          setIsPremium(true);
          localStorage.setItem('pocketAce_isPremium', 'true');
        }
      });
    });

    try {
      const saved = localStorage.getItem(GAME_SAVE_KEY);
      if (saved) {
        const { phase: savedPhase, players: savedPlayers, settings: savedSettings } = JSON.parse(saved);
        if (savedPlayers?.length > 0 && mounted) {
          setPlayers(savedPlayers);
          setSettings(savedSettings);
          setPhase(savedPhase);
          return;
        }
      }
    } catch { /* fall through to lobby */ }

    if (mounted) setPhase(GamePhaseEnum.LOBBY);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (!mounted) return;
    if (event === 'SIGNED_IN' && session) {
      const user = sessionToUser(session);
      setCurrentUser(user);
      setPhase(prev => prev === GamePhaseEnum.AUTH ? GamePhaseEnum.LOBBY : prev);
    } else if (event === 'SIGNED_OUT') {
      setCurrentUser(null);
      setPhase(GamePhaseEnum.AUTH);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);
```

- [ ] **Step 3: Remove `handleAuthSuccess` and update `handleLogout`**

Remove this block entirely:
```typescript
const handleAuthSuccess = useCallback((user: User) => {
  setCurrentUser(user);
  setPhase(GamePhaseEnum.LOBBY);
}, []);
```

Replace `handleLogout` with:
```typescript
const handleLogout = useCallback(async () => {
  await signOut();
  localStorage.removeItem(GAME_SAVE_KEY);
  localStorage.removeItem('pocketAce_isPremium');
  setCurrentUser(null);
  setIsPremium(false);
  setPhase(GamePhaseEnum.AUTH);
}, []);
```

- [ ] **Step 4: Update the AUTH phase render**

Replace:
```tsx
{phase === GamePhaseEnum.AUTH && (
  <Auth onAuthSuccess={handleAuthSuccess} />
)}
```

with:
```tsx
{phase === GamePhaseEnum.AUTH && <Auth />}
```

- [ ] **Step 5: Remove unused `User` type import if it was only used by `handleAuthSuccess`**

Check the imports line. If `User` is no longer referenced in `App.tsx` after removing `handleAuthSuccess`, remove it:

```typescript
import type { GamePhase, GameSettings, Player, PlayerSettlement, Debt } from './types';
```

(Remove `User` from the import — it's no longer needed in App.tsx since `sessionToUser` returns it but we only store it as `User | null` state which is inferred.)

Actually keep `User` if the `useState<User | null>` still needs it explicitly. Check the line:
```typescript
const [currentUser, setCurrentUser] = useState<User | null>(null);
```
If this line exists unchanged, keep `User` in the import.

- [ ] **Step 6: Run lint**

```bash
npm run lint -- src/App.tsx
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: replace localStorage auth boot with Supabase getSession + onAuthStateChange"
```

---

## Task 6: Rewrite Auth.tsx

**Files:**
- Rewrite: `src/components/Auth.tsx`

The component loses the `onAuthSuccess` prop (App.tsx handles the transition via `onAuthStateChange`). The phone input becomes email. The verification-code step becomes a "check your inbox" screen.

- [ ] **Step 1: Replace the entire contents of `src/components/Auth.tsx`**

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User as UserIcon } from 'lucide-react';
import { sendMagicLink } from '../utils/auth';
import '../styles/auth.css';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'initial' | 'sent'>('initial');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && !name.trim()) {
      setError('נא הזן שם');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('נא הזן כתובת אימייל תקינה');
      return;
    }

    setLoading(true);
    try {
      const result = await sendMagicLink(email, isLogin ? undefined : name);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep('sent');
    } catch {
      setError('אירעה שגיאה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-glow" />
      <div className="auth-inner">
        <AnimatePresence mode="wait">
          {step === 'initial' ? (
            <motion.div
              key="initial"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="auth-logo-card">♠</div>
              <h1 className="auth-app-name">Pocket Ace</h1>
              <p className="auth-tagline">תן לקלפים לדבר בשבילך ♠</p>

              <div className="auth-tab-switcher">
                <button
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => { setIsLogin(true); setError(''); }}
                >כניסה</button>
                <button
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => { setIsLogin(false); setError(''); }}
                >הרשמה</button>
              </div>

              <form className="auth-inputs" onSubmit={handleSubmit} style={{ width: '100%' }}>
                {!isLogin && (
                  <div className="auth-input-row">
                    <span className="auth-input-icon"><UserIcon size={15} /></span>
                    <input
                      type="text"
                      placeholder="שם מלא"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}
                <div className="auth-input-row">
                  <span className="auth-input-icon"><Mail size={15} /></span>
                  <input
                    type="email"
                    placeholder="כתובת אימייל"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    dir="ltr"
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button className="auth-cta" type="submit" disabled={loading}>
                  {loading ? '...' : 'בוא נשחק 🤙'}
                </button>
              </form>

              <div className="auth-divider">
                {isLogin
                  ? <span onClick={() => { setIsLogin(false); setError(''); }}>פתח חשבון — זה שניה</span>
                  : <span onClick={() => { setIsLogin(true); setError(''); }}>כבר יש לך חשבון? כנסו</span>
                }
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="auth-logo-card">📧</div>
              <h2 className="auth-verify-title">בדוק את האימייל שלך</h2>
              <p className="auth-verify-sub">שלחנו קישור כניסה ל־{email}</p>
              <p className="auth-verify-sub" style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                לחץ על הקישור במייל כדי להיכנס
              </p>

              <div className="auth-link" style={{ marginTop: '2rem' }}>
                <span onClick={() => { setStep('initial'); setError(''); }}>← חזור</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Run lint**

```bash
npm run lint -- src/components/Auth.tsx
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Auth.tsx
git commit -m "feat: rewrite Auth.tsx with email magic link UI"
```

---

## Task 7: Delete firebase.ts and final build verification

**Files:**
- Delete: `src/config/firebase.ts`

- [ ] **Step 1: Delete `firebase.ts`**

```bash
rm "src/config/firebase.ts"
```

- [ ] **Step 2: Run full lint**

```bash
npm run lint
```

Expected: zero errors. If any file still imports from `firebase` or references `phone`, fix those before proceeding.

- [ ] **Step 3: Run full build**

```bash
npm run build
```

Expected: TypeScript check passes, Vite build completes with no errors.

- [ ] **Step 4: Manual smoke test**

```bash
npm run dev
```

Open `http://localhost:5173` in browser. Verify:
1. Auth screen shows email input (not phone)
2. Register tab shows name + email fields
3. Submitting a real email address shows "check your inbox" screen
4. Clicking the magic link in the email redirects to `localhost:5173` and the app transitions to LOBBY
5. User name and email are correct in the lobby
6. Logout returns to AUTH screen

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: delete firebase.ts, complete Supabase migration"
```
