# Device Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase OTP auth with a device-local UUID identity stored in localStorage — no network calls, no email, no OTP.

**Architecture:** On first launch the user enters their name; `crypto.randomUUID()` generates their `id`. Both are saved to `pocketAce_user` in localStorage and read directly on every subsequent launch. Supabase is removed entirely.

**Tech Stack:** React 19, TypeScript, Vite, localStorage (`crypto.randomUUID` built-in)

**Spec:** `docs/superpowers/specs/2026-04-25-device-identity-design.md`

---

## File Map

| Action | File | What changes |
|--------|------|--------------|
| Modify | `src/utils/auth.ts` | Full rewrite — Supabase fns → `getStoredUser` / `createUser` / `signOut` |
| Modify | `src/components/Auth.tsx` | Full rewrite — OTP flow → single name-input form |
| Modify | `src/App.tsx` | Remove `supabase` import + `onAuthStateChange` effect; add localStorage init effect; remove `handleLogout` |
| Modify | `src/components/Lobby.tsx` | Remove `onLogout` prop + logout button |
| Delete | `src/config/supabase.ts` | No longer imported anywhere |

---

### Task 1: Rewrite `src/utils/auth.ts`

**Files:**
- Modify: `src/utils/auth.ts`

- [ ] **Step 1: Replace the file contents**

```typescript
import type { User } from '../types';

const USER_KEY = 'pocketAce_user';

export const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

export const createUser = (name: string): User => {
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: '',
    createdAt: Date.now(),
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const signOut = (): void => {
  localStorage.removeItem(USER_KEY);
};
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: `✓ built in ~Xs` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/auth.ts
git commit -m "refactor: replace Supabase auth with localStorage device identity"
```

---

### Task 2: Rewrite `src/components/Auth.tsx`

**Files:**
- Modify: `src/components/Auth.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createUser } from '../utils/auth';
import type { User } from '../types';
import '../styles/auth.css';

interface AuthProps {
  onAuth: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('נא הזן שם');
      return;
    }
    const user = createUser(name);
    onAuth(user);
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg-spade">♠</div>

      {(['♠', '♣', '♥', '♦'] as const).map((suit, i) => (
        <div
          key={suit}
          className="auth-suit"
          style={{
            fontSize: [60, 44, 52, 40][i],
            color: `rgba(200,190,168,${[0.04, 0.03, 0.035, 0.025][i]})`,
            top:  ['8%', '70%', '60%', '18%'][i],
            left: ['5%', '76%',  '7%', '80%'][i],
            animation: `auth-float ${[4, 4.8, 5.2, 4.4][i]}s ease-in-out infinite`,
            animationDelay: `${[0, 0.7, 1.3, 0.4][i]}s`,
          }}
        >
          {suit}
        </div>
      ))}

      <div className="auth-inner">
        <motion.div
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="auth-logo-wrap">
            <div className="auth-logo-text">
              Pocket<br />
              <span className="auth-logo-ace">Ace</span>
            </div>
            <div className="auth-logo-sub">ניהול שולחן פוקר</div>
          </div>

          <div className="auth-card surface">
            <form className="auth-inputs" onSubmit={handleSubmit}>
              <div>
                <div className="auth-input-label">איך קוראים לך?</div>
                <input
                  className="input-new"
                  type="text"
                  placeholder="שם / כינוי"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  autoComplete="name"
                  autoFocus
                  style={{ direction: 'rtl', minHeight: 'unset' }}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <motion.button
                className="btn-new btn-sage auth-cta"
                type="submit"
                whileTap={{ scale: 0.97 }}
              >
                כנסו ♠
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```
Expected: TypeScript will complain that `App.tsx` still passes no `onAuth` prop and still imports the old auth functions. That's fine — we fix App next.

- [ ] **Step 3: Commit**

```bash
git add src/components/Auth.tsx
git commit -m "refactor: Auth screen — replace OTP flow with name input"
```

---

### Task 3: Update `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Remove Supabase imports and add `getStoredUser` import**

Replace the top import block. Find:
```typescript
import { sessionToUser, signOut } from './utils/auth';
import { supabase } from './config/supabase';
```
Replace with:
```typescript
import { getStoredUser } from './utils/auth';
```

- [ ] **Step 2: Remove `handleLogout` callback**

Delete the entire `handleLogout` `useCallback` block:
```typescript
  const handleLogout = useCallback(async () => {
    await signOut();
    localStorage.removeItem(GAME_SAVE_KEY);
    localStorage.removeItem('pocketAce_isPremium');
    setCurrentUser(null);
    setPhase(GamePhaseEnum.AUTH);
  }, []);
```

- [ ] **Step 3: Replace the Supabase auth `useEffect` with a localStorage init effect**

Find and delete the entire first `useEffect` (the one that contains `supabase.auth.onAuthStateChange`). Replace it with:

```typescript
  useEffect(() => {
    const user = getStoredUser();
    if (!user) return; // stay on AUTH
    setCurrentUser(user);
    try {
      const saved = localStorage.getItem(GAME_SAVE_KEY);
      if (saved) {
        const { phase: savedPhase, players: savedPlayers, settings: savedSettings, gameStartedAt: savedStartedAt } = JSON.parse(saved);
        if (savedPlayers?.length > 0) {
          setPlayers(savedPlayers);
          setSettings(savedSettings);
          setPhase(savedPhase);
          setGameStartedAt(savedStartedAt ?? null);
          return;
        }
      }
    } catch { /* fall through */ }
    setPhase(GamePhaseEnum.LOBBY);
  }, []);
```

- [ ] **Step 4: Add `handleAuth` callback and wire up the Auth component**

Add this callback after `handlePremiumChange`:
```typescript
  const handleAuth = useCallback((user: User) => {
    setCurrentUser(user);
    setPhase(GamePhaseEnum.LOBBY);
  }, []);
```

Then update the JSX for the AUTH phase — find:
```tsx
      {phase === GamePhaseEnum.AUTH && <Auth />}
```
Replace with:
```tsx
      {phase === GamePhaseEnum.AUTH && <Auth onAuth={handleAuth} />}
```

- [ ] **Step 5: Remove `onLogout` from the Lobby JSX**

Find:
```tsx
        <Lobby
          onStartGame={handleStartFromLobby}
          user={currentUser}
          onLogout={handleLogout}
          isPremium={isPremium}
          onPremiumChange={handlePremiumChange}
        />
```
Replace with:
```tsx
        <Lobby
          onStartGame={handleStartFromLobby}
          user={currentUser}
          isPremium={isPremium}
          onPremiumChange={handlePremiumChange}
        />
```

- [ ] **Step 6: Verify build passes**

```bash
npm run build
```
Expected: TypeScript will complain that `Lobby` still has `onLogout` in its props interface. That's fine — we fix Lobby next.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: App.tsx — replace Supabase auth listener with localStorage init"
```

---

### Task 4: Update `src/components/Lobby.tsx`

**Files:**
- Modify: `src/components/Lobby.tsx`

- [ ] **Step 1: Remove `onLogout` from the `LobbyProps` interface**

Find:
```typescript
interface LobbyProps {
  onStartGame: (selectedNames: string[]) => void;
  user: User;
  onLogout: () => void;
  isPremium: boolean;
  onPremiumChange: (value: boolean) => void;
}
```
Replace with:
```typescript
interface LobbyProps {
  onStartGame: (selectedNames: string[]) => void;
  user: User;
  isPremium: boolean;
  onPremiumChange: (value: boolean) => void;
}
```

- [ ] **Step 2: Remove `onLogout` from the component destructure**

Find:
```typescript
export const Lobby: React.FC<LobbyProps> = ({ onStartGame, user, onLogout, isPremium, onPremiumChange }) => {
```
Replace with:
```typescript
export const Lobby: React.FC<LobbyProps> = ({ onStartGame, user, isPremium, onPremiumChange }) => {
```

- [ ] **Step 3: Remove the logout button from the top bar**

Find:
```tsx
      <div className="lobby-topbar">
        <div>
          <div className="lobby-greeting-label">שלום,</div>
          <div className="lobby-greeting-name">{firstName}</div>
        </div>
        <button className="lobby-exit-btn" onClick={onLogout}>יציאה</button>
      </div>
```
Replace with:
```tsx
      <div className="lobby-topbar">
        <div>
          <div className="lobby-greeting-label">שלום,</div>
          <div className="lobby-greeting-name">{firstName}</div>
        </div>
      </div>
```

- [ ] **Step 4: Verify build passes cleanly**

```bash
npm run build
```
Expected: `✓ built in ~Xs` — zero TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Lobby.tsx
git commit -m "refactor: Lobby — remove logout button and onLogout prop"
```

---

### Task 5: Delete `src/config/supabase.ts` and clean up

**Files:**
- Delete: `src/config/supabase.ts`

- [ ] **Step 1: Delete the file**

```bash
rm "src/config/supabase.ts"
```

- [ ] **Step 2: Verify no remaining imports**

```bash
grep -r "supabase" src/ --include="*.ts" --include="*.tsx"
```
Expected: no output (zero matches).

- [ ] **Step 3: Final build verification**

```bash
npm run build
```
Expected: `✓ built in ~Xs` — zero TypeScript errors, zero warnings about missing modules.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete supabase.ts — no longer used after device identity migration"
```

---

### Task 6: Push

- [ ] **Step 1: Push to remote**

```bash
git push
```

---

## Self-Review

**Spec coverage:**
- ✅ `getStoredUser` / `createUser` / `signOut` in auth.ts — Task 1
- ✅ Name-input Auth screen — Task 2
- ✅ Remove `onAuthStateChange`, add localStorage init — Task 3
- ✅ `handleAuth` callback + `onAuth` prop wired — Task 3
- ✅ Remove `onLogout` from Lobby — Task 4
- ✅ Delete `supabase.ts` — Task 5
- ✅ `email: ''` kept for type compat — Task 1

**Placeholder scan:** None found.

**Type consistency:**
- `createUser(name: string): User` — defined Task 1, consumed Task 2 ✅
- `getStoredUser(): User | null` — defined Task 1, consumed Task 3 ✅
- `Auth` prop `onAuth: (user: User) => void` — defined Task 2, wired Task 3 ✅
- `LobbyProps` without `onLogout` — defined Task 4, call site updated Task 3 ✅
