# Device Identity — Remove Supabase Auth

**Date:** 2026-04-25  
**Status:** Approved

## Problem

Supabase auth adds OTP email friction with no real benefit — all app data lives in `localStorage`, so a cloud identity doesn't sync or back up anything. The login/signup flow is unnecessary complexity.

## Goal

Replace Supabase auth with a device-local identity: random UUID + user-chosen name, persisted in `localStorage`. Zero network calls on launch.

## Identity Model

On first launch the user enters their name. The app generates a `crypto.randomUUID()` as their `id` and writes the full `User` object to `localStorage` under `pocketAce_user`. All subsequent launches read that key directly and skip the auth screen.

```ts
// pocketAce_user shape (unchanged User type)
{
  id: string;       // crypto.randomUUID()
  name: string;     // entered by user
  email: string;    // always '' — kept for type compatibility
  createdAt: number;
}
```

All downstream keys (`pocketAce_gameHistory_<userId>`, etc.) continue to use this `id` — no other storage changes needed.

## File Changes

### `src/utils/auth.ts` — full rewrite
Three exports replace the Supabase functions:
- `getStoredUser(): User | null` — reads and parses `pocketAce_user`
- `createUser(name: string): User` — generates UUID, saves, returns User
- `signOut(): void` — kept as a no-op export so any stale import doesn't break; body is empty

### `src/components/Auth.tsx` — replace OTP flow with name form
Single screen: name input field + submit button. Calls `createUser(name)` then sets `currentUser` in App state. Placeholder UI — will be fully redesigned in a follow-up.

Validation: name must be non-empty after trim. No email, no OTP, no loading state.

### `src/App.tsx`
- Remove `supabase` import and the `onAuthStateChange` effect entirely
- Add a `useEffect(() => { ... }, [])` that on mount:
  1. Reads `getStoredUser()`
  2. If found: sets `currentUser`, restores game from localStorage or goes to LOBBY
  3. If not found: stays on AUTH phase
- `handleLogout` removed — no longer needed
- `onLogout` prop removed from `<Lobby>` call

### `src/components/Lobby.tsx`
- Remove `onLogout` from `LobbyProps` interface
- Remove the "יציאה" logout button from the top bar

### `src/config/supabase.ts` — deleted
No longer imported anywhere.

### `src/types.ts`
No changes needed — `User.email` stays as `string` (always `''`).

## What Does NOT Change

- All localStorage keys and their shapes
- Game history, regulars, settlements, debts logic
- All other components (GameSetup, GameTable, EndGame, SettlementResults)
- The `User` type interface

## Out of Scope

- Welcome screen redesign (separate follow-up)
- Cloud sync / Supabase DB (Option B, not chosen)
- Any existing localStorage data migration (new UUID on first launch after update is acceptable)
