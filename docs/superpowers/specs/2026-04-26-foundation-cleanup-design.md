# Foundation Cleanup — Design Spec

**Date:** 2026-04-26  
**Scope:** Code quality, deduplication, typed storage layer. Zero user-facing behavior changes.

---

## Problem Summary

The codebase has several concrete quality issues identified by audit:

1. **Lint error** — `App.tsx` and `GameSetup.tsx` call `setState` synchronously inside `useEffect`, triggering cascading renders. GameSetup suppresses the error with a comment rather than fixing it.
2. **Lint warning** — `App.tsx` second `useEffect` is missing `gameStartedAt` in its dependency array.
3. **Dead code** — `EndGame.tsx` accepts an `onHome` prop that is never used.
4. **Code duplication** — `PLAYER_COLORS` and `PLAYER_EMOJIS` are copy-pasted across `GameSetup.tsx`, `EndGame.tsx`, and `SettlementResults.tsx`. Each file has a slightly different shape, making them diverge silently.
5. **UX anti-pattern** — `GameSetup.tsx` uses `alert()` for duplicate-player validation. `alert()` blocks the thread, breaks on iOS WebView, and looks broken in a native Capacitor shell.
6. **Scattered localStorage** — Keys and JSON parse/stringify are spread across `App.tsx`, `auth.ts`, `regulars.ts`, `gameHistory.ts`, and `Lobby.tsx` inline. No single source of truth for what's persisted.
7. **Stale docs** — `CLAUDE.md` references `--yellow: #f5c518` which no longer exists; the token was redesigned to `--gold: #C49A2C`.

---

## Design

### 1. `src/utils/storage.ts` (new file)

Central typed localStorage layer. Owns every key string and every parse/serialize operation. Nothing else in the codebase imports a localStorage key string directly.

**Keys owned:**
- `pocketAce_user`
- `pocketAce_currentGame`
- `pocketAce_regulars`
- `pocketAce_isPremium`
- `pocketAceVisited`
- `pocketAce_gameHistory_{userId}` (dynamic)

**API shape:**
```ts
export const storage = {
  // User session
  getUser(): User | null
  setUser(user: User): void
  clearUser(): void

  // In-progress game
  getCurrentGame(): SavedGame | null
  setCurrentGame(game: SavedGame): void
  clearCurrentGame(): void

  // Regulars roster
  getRegulars(): string[]
  setRegulars(names: string[]): void

  // Premium flag
  getIsPremium(): boolean
  setIsPremium(val: boolean): void
  clearIsPremium(): void

  // First-visit flag
  getVisited(): boolean
  setVisited(): void

  // Game history (per user)
  getGameHistory(userId: string): GameRecord[]
  setGameHistory(userId: string, records: GameRecord[]): void
  clearGameHistory(userId: string): void
}
```

`SavedGame` is a new interface in `types.ts`:
```ts
export interface SavedGame {
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  gameStartedAt: number | null;
}
```

All reads are wrapped in try/catch returning a safe default. All writes are fire-and-forget (no return value).

### 2. `src/utils/playerColors.ts` (new file)

Single source of truth for player color palettes and emojis, used by `GameSetup`, `EndGame`, and `SettlementResults`.

```ts
export const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'] as const;

// Full palette — used by EndGame (needs all fields)
export const PLAYER_PALETTES = [
  { bg: '...', cardBg: '...', border: '...', glow: '...', text: '...' },
  // ... 6 entries
] as const;

// Convenience for components that only need the gradient
export const getPlayerGradient = (index: number): string =>
  PLAYER_PALETTES[index % PLAYER_PALETTES.length].bg;

export const getPlayerEmoji = (index: number): string =>
  PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];
```

### 3. `App.tsx` — lazy state initialization

Replace the init `useEffect` (which sets multiple state values synchronously, triggering cascading renders) with a lazy initializer function called once at mount:

```ts
const getInitialAppState = (): InitialAppState => {
  const user = storage.getUser();
  if (!user) return { user: null, phase: GamePhaseEnum.AUTH, players: [], settings: DEFAULT_SETTINGS, gameStartedAt: null };

  const saved = storage.getCurrentGame();
  if (saved?.players?.length > 0) {
    return { user, phase: saved.phase, players: saved.players, settings: saved.settings, gameStartedAt: saved.gameStartedAt };
  }

  return { user, phase: GamePhaseEnum.LOBBY, players: [], settings: DEFAULT_SETTINGS, gameStartedAt: null };
};
```

Each `useState` call uses this object for its initial value via `useState(() => getInitialAppState().field)`. The function runs once, synchronously, before first render. No effects, no cascading.

Add `gameStartedAt` to the second `useEffect` dep array (the one that saves to localStorage).

### 4. `GameSetup.tsx` — lazy player init + Toast

Replace:
```ts
const [players, setPlayers] = useState<Player[]>([]);
useEffect(() => {
  if (existingPlayers.length > 0) setPlayers(existingPlayers); // eslint-disable...
}, [existingPlayers]);
```

With:
```ts
const [players, setPlayers] = useState<Player[]>(() => existingPlayers);
```

Replace `alert('שחקן בשם...')` with the existing `Toast` component (already used in `GameTable.tsx`). Add `toastMessage` state, render `<Toast />` at the bottom of the component.

Fix import order: `import type` declarations must come before value imports per ESLint rules.

### 5. `EndGame.tsx` — remove dead prop

Remove `onHome` from the `EndGameProps` interface and from the destructuring. It is passed by `App.tsx` but never referenced inside the component. `App.tsx` call site also updated (stop passing the prop).

Fix import order same as GameSetup.

### 6. `auth.ts`, `regulars.ts`, `gameHistory.ts` — delegate to storage.ts

Each util keeps its current public API (no callers change). Internally, localStorage calls are replaced with `storage.*` calls. The key strings move out of these files entirely.

### 7. `Lobby.tsx` — use storage.ts

Replace `localStorage.getItem('pocketAceVisited')` / `localStorage.setItem('pocketAceVisited', 'true')` and `localStorage.getItem('pocketAce_isPremium')` / `localStorage.setItem`/`removeItem` with `storage.getVisited()`, `storage.setVisited()`, `storage.getIsPremium()`, `storage.setIsPremium()`, `storage.clearIsPremium()`.

Note: `isPremium` state is currently owned by `App.tsx` and passed down as a prop. `Lobby.tsx` doesn't read it from storage directly — `App.tsx` does. So only the `pocketAceVisited` key moves in Lobby. The isPremium storage calls move from `App.tsx` to `storage.ts`.

### 8. `CLAUDE.md` update

Change `--yellow (#f5c518)` to `--gold (#C49A2C)` in the Styling section.

---

## What Does NOT Change

- No component APIs change (same props in/out)
- No user-visible behavior changes
- No CSS changes
- No routing or phase logic changes
- `loserInsults.ts` and `winnerInsults.ts` are left as-is (they manage their own localStorage shuffle state internally and are self-contained)

---

## File Change Summary

| File | Action |
|------|--------|
| `src/utils/storage.ts` | Create |
| `src/utils/playerColors.ts` | Create |
| `src/utils/auth.ts` | Update — use storage.ts |
| `src/utils/regulars.ts` | Update — use storage.ts |
| `src/utils/gameHistory.ts` | Update — use storage.ts |
| `src/types.ts` | Add `SavedGame` interface |
| `src/App.tsx` | Update — lazy init, deps fix, use storage.ts |
| `src/components/GameSetup.tsx` | Update — lazy players, Toast, import order |
| `src/components/EndGame.tsx` | Update — remove dead prop, import order |
| `src/components/GameTable.tsx` | No change |
| `src/components/SettlementResults.tsx` | Update — use playerColors.ts |
| `src/components/Lobby.tsx` | Update — use storage.ts for visited key |
| `CLAUDE.md` | Update — fix design token reference |
