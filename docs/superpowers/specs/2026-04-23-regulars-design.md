# החבר׳ה הקבועים — Design Spec

**Date:** 2026-04-23

## Overview

Make the "החבר׳ה הקבועים" section in the Lobby functional. Users save a list of regular players, select who's playing tonight directly from the Lobby, and those players are auto-added when the game setup screen opens.

---

## Data Storage

- Key: `pocketAce_regulars`
- Value: `string[]` — array of player names
- Location: `localStorage`, consistent with all other app persistence
- No max size enforced; the UI wraps naturally

---

## Lobby — Normal Mode

- Regulars are displayed in the existing crew row (avatar + name per player).
- Each avatar uses the existing `CREW_COLORS` / `CREW_EMOJIS` arrays, indexed by position.
- **Tap an avatar** → selected state: yellow ring (`box-shadow: 0 0 0 2.5px var(--yellow)`) + ✓ badge in bottom-right corner.
- **Tap again** → deselected.
- The "פותחים שולחן" CTA button shows a yellow badge with the count of selected players when ≥1 is selected (e.g. `2 נבחרו`).
- If no regulars are saved, the section shows just the "+" add button.

---

## Lobby — Adding a Regular

- Tapping the "+" avatar opens a small **bottom sheet** (same spring animation pattern used for game detail sheets already in Lobby).
- Sheet contains: a text input (Hebrew placeholder `שם השחקן...`), and a yellow confirm button `+ הוסף`.
- Enter key also confirms.
- On confirm: name is trimmed, validated non-empty, appended to `pocketAce_regulars` in localStorage, sheet closes, list re-renders.

---

## Lobby — Removing a Regular

- **Long-press (500ms)** on a regular's avatar → red ring + a small tooltip above the avatar: `הסר?`.
- Tapping the tooltip removes the player from localStorage and re-renders.
- Tapping anywhere else dismisses the tooltip without removing.
- Only one player can be in "pending removal" state at a time.

---

## Game Setup — Pre-populated Players

- `App.tsx` passes the list of selected regular names to `GameSetup` as a new prop: `preselectedNames: string[]`.
- `GameSetup` converts each name to a `Player` object (same shape as existing auto-added host) and adds them to the initial `players` state alongside the host.
- Pre-populated players are not marked as host; they can be removed normally.
- If `preselectedNames` is empty, behaviour is unchanged from today.

---

## Results Screen — Add to Regulars

After a game ends, `SettlementResults` shows each player's result. For any player who is **not already** in `pocketAce_regulars`, a small `+ קבועים` button appears next to their name row.

- Tapping it adds the player to regulars immediately (via `addRegular`) and the button changes to a `✓ קבוע` confirmation state.
- The host (current user) is excluded — no button shown for their own row.
- Players already in the regulars list show no button (no clutter).

---

## Files Changed

| File | Change |
|------|--------|
| `src/utils/regulars.ts` | New utility — `getRegulars()`, `addRegular(name)`, `removeRegular(name)` |
| `src/components/Lobby.tsx` | Replace hardcoded crew stub with real regulars list + selection state + add/remove UX |
| `src/styles/lobby.css` | Add styles for selected state, long-press ring, tooltip, bottom sheet |
| `src/components/GameSetup.tsx` | Accept `preselectedNames` prop and pre-populate players |
| `src/components/SettlementResults.tsx` | Add "+ קבועים" button per non-regular player; toggles to "✓ קבוע" on tap |
| `src/App.tsx` | Thread selected regulars from Lobby → GameSetup |
| `src/types.ts` | No changes needed |

---

## Out of Scope

- Editing a regular's name (remove + re-add)
- Reordering regulars
- Per-regular stats or history
- Syncing regulars across devices
