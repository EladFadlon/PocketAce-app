# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript check + production build
npm run lint     # ESLint across all files
npm run preview  # Preview production build locally

# Capacitor (native iOS/Android)
npx cap sync     # Sync web build to native projects
npx cap open ios     # Open Xcode
npx cap open android # Open Android Studio
```

No test suite exists in this project.

## Architecture

**PocketAce** is a mobile-first poker game manager (Hebrew/RTL UI) built with React 19 + TypeScript + Vite. All data lives exclusively in `localStorage` — there is no backend, database, or external auth service.

### Phase-Based Navigation (no React Router)

`App.tsx` owns all game state via `useState`. Navigation is a phase enum:

```
AUTH → LOBBY → SETUP → TABLE → END_GAME → RESULTS → (back to LOBBY)
```

Each phase renders one full-screen component. There are no URLs or routes.

### State & Persistence

- `App.tsx` is the single source of truth — players, settings, settlements, debts
- `pocketAce_currentGame` — active game snapshot (written during TABLE/END_GAME, cleared on LOBBY/RESULTS)
- `pocketAce_user` — current user session (`{ id, name, email, createdAt }`)
- `pocketAce_gameHistory_{userId}` — per-user array of `GameRecord` (max 100)
- `pocketAce_regulars` — JSON array of saved player name strings
- `pocketAce_isPremium` — boolean flag for premium state (payment not yet implemented)
- `pocketAceVisited` — first-visit flag for the welcome popup

### Business Logic (`src/utils/`)

- **`settlements.ts`**: All monetary math in agorot (×100 integer). `calculatePlayerSettlements` computes each player's P&L; `minimizeDebts` runs a greedy algorithm to produce the minimum number of transfers. `generateWhatsAppMessage` / `getWhatsAppShareURL` produce the share text.
- **`auth.ts`**: Simple localStorage CRUD — `createUser`, `getStoredUser`, `signOut`. No external auth; identity is a name the user types on first launch.
- **`gameHistory.ts`**: Saves/retrieves `GameRecord` objects per user. Also exports `calculateCumulativeProfitLoss` and `getCumulativeStatus` (badge + humorous Hebrew message based on cumulative P&L tiers).
- **`regulars.ts`**: `getRegulars` / `addRegular` / `removeRegular` — manages the saved crew list shown in Lobby.
- **`loserInsults.ts`** / **`winnerInsults.ts`**: Pools of humorous Hebrew insults shown on the results screen, keyed by shuffle state in localStorage.

### Styling

- Each component has its own `.css` file in `src/styles/`
- Design tokens defined in `src/index.css` as CSS custom properties — always use these, never hardcode colors or radii
- Key tokens: `--gold` (`#C49A2C`) is the primary brand/CTA color (aliased as `--yellow` for legacy components); `--bg-primary` (`var(--bg0)` = `#1A1614`) is the base background
- `src/utils/playerColors.ts` is the single source for `PLAYER_PALETTES` and `PLAYER_EMOJIS` — used by `GameSetup`, `EndGame`, and `SettlementResults`
- Dark mode only, RTL (`direction: rtl`) set at root
- Minimum touch target: `--touch: 48px`
- Visual language: glassmorphism with frosted semi-transparent layers and yellow glow on interactive elements
- Font stack: Inter, Heebo, Assistant (RTL-optimized Hebrew fonts)
- Framer Motion (`motion.*`, `AnimatePresence`) is used throughout for spring animations and bottom-sheet transitions

### Deployment Targets

The app ships in three forms from the same codebase:
1. **PWA** — `vite-plugin-pwa` with `autoUpdate` service worker, portrait orientation, Hebrew locale
2. **iOS** — Capacitor wrapping the `dist/` build (`appId: com.pocketace.app`)
3. **Android** — same Capacitor config, `androidScheme: https`

### TypeScript

All shared interfaces live in `src/types.ts`. Compiler is set to strict mode (`tsconfig.app.json`). `GamePhase` is both a union type and a const object exported from the same file.

