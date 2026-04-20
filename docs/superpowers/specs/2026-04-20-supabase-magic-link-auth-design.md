# Supabase Magic Link Auth — Design Spec

**Date:** 2026-04-20
**Status:** Approved

## Summary

Replace the current mock phone/SMS auth (Firebase configured but unused, verification codes stored in sessionStorage) with real Supabase magic link email authentication. Phone is removed entirely from the data model and UI.

---

## Data Model

`User` in `src/types.ts`:

```typescript
interface User {
  id: string;       // Supabase user UUID
  name: string;     // from Supabase user_metadata.name
  email: string;    // Supabase auth email (replaces phone)
  createdAt: number;
}
```

- `pocketAce_users` (localStorage user map) is removed — Supabase owns identity
- `pocketAce_user` (localStorage session) is removed — Supabase JWT session replaces it
- All game data keys (`pocketAce_currentGame`, `pocketAce_gameHistory`, etc.) are untouched

---

## Auth Flow

### Registration
1. User enters name + email in Auth.tsx
2. `supabase.auth.signInWithOtp({ email, options: { data: { name } } })`
3. Supabase sends magic link email
4. User clicks link → browser returns to app with token in URL
5. Supabase SDK auto-exchanges token
6. `onAuthStateChange` fires with `SIGNED_IN` + session
7. App extracts `session.user.user_metadata.name` and `session.user.email` → builds `User` object → transitions to LOBBY

### Login
1. User enters email only
2. `supabase.auth.signInWithOtp({ email })` — no `data` payload
3. Same link → callback → `SIGNED_IN` flow as above
4. After `SIGNED_IN`, check `session.user.user_metadata.name` — if missing, Auth.tsx shows a name-entry step before proceeding to LOBBY (prevents nameless accounts)

### App Boot
1. `App.tsx` calls `supabase.auth.getSession()` on mount
2. If session exists → skip AUTH, go to LOBBY
3. `onAuthStateChange` listener handles `SIGNED_IN` / `SIGNED_OUT` throughout app lifetime

### Sign-out
- `supabase.auth.signOut()` — clears Supabase JWT
- Existing logout logic (clears `pocketAce_currentGame`) is preserved

---

## Redirect URL

- Development: `http://localhost:5173`
- Production: deployed app URL
- Both must be whitelisted in Supabase dashboard → Authentication → URL Configuration

---

## Files Changed

| File | Change |
|------|--------|
| `src/config/firebase.ts` | Deleted |
| `src/config/supabase.ts` | New — Supabase client init via `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |
| `src/utils/auth.ts` | Rewritten — `sendMagicLink(email, name?)`, `signOut()`, `getCurrentUser()` |
| `src/types.ts` | `User.phone` → `User.email` |
| `src/components/Auth.tsx` | Phone input → email input; code entry step → "check your inbox" screen |
| `src/App.tsx` | Boot: `getSession()` + `onAuthStateChange` replaces synchronous localStorage read |
| `.env.local` | Firebase vars → Supabase vars |
| `package.json` | Remove `firebase`, add `@supabase/supabase-js` |

---

## Out of Scope

- Supabase database / profiles table — all game data stays in localStorage
- Any changes to settlements, WhatsApp share, credits, game history, or game logic
