# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript check + production build
npm run lint     # ESLint across all files
npm run preview  # Preview production build locally
```

No test suite exists in this project.

## Architecture

**PocketAce** is a mobile-first poker game manager (Hebrew/RTL UI) built with React 19 + TypeScript + Vite. Firebase is used only for SMS phone authentication — all game/user data lives in `localStorage`.

### Phase-Based Navigation (no React Router)

`App.tsx` owns all game state via `useState`. Navigation is a phase enum:

```
AUTH → LOBBY → SETUP → TABLE → END_GAME → RESULTS → (back to LOBBY)
```

Each phase renders one component. There are no URLs or routes.

### State & Persistence

- `App.tsx` is the single source of truth — players, settings, settlements, debts, hostFee
- Current game survives page refresh via `localStorage` key `pocketAce_currentGame`
- User session persisted under `pocketAce_user`
- All user records stored as JSON under `pocketAce_users`
- Device fingerprint (UA + language hash) lives in `pocketAce_deviceId` for rate-limiting

### Modal System

Modals (`src/components/modals/`) use a **global callback ref pattern** in `ModalManager.tsx` — not context or Redux. Call `showModal(type, options)` from anywhere; the manager dispatches to the correct modal component.

### Business Logic (`src/utils/`)

- **`settlements.ts`**: All monetary math in agorot (×100 integer). Greedy debt-minimization algorithm. Generates WhatsApp share messages.
- **`auth.ts`**: Phone verification with 5-min window, device rate-limiting (1 account/device/24h), 3 credits on signup.
- **`credits.ts`**: In-app credit economy.
- **`gameHistory.ts`**: Persists completed game records.
- **`loserInsults.ts`**: Pool of humorous Hebrew insults for the results screen.

### Styling

- Each component has its own `.css` file in `src/styles/`
- Design tokens defined in `src/index.css` as CSS custom properties — always use these, never hardcode colors or radii
- Key tokens: `--yellow` (`#f5c518`) is the primary brand/CTA color; `--bg-primary` (`#080810`) is the base background
- Dark mode only, RTL (`direction: rtl`) set at root
- Minimum touch target: `--touch: 48px`
- Visual language: glassmorphism with frosted semi-transparent layers and yellow glow on interactive elements
- Font stack: Inter, Heebo, Assistant (RTL-optimized Hebrew fonts)

### Firebase

Configured in `src/config/firebase.ts`, keys loaded from `.env.local` via `import.meta.env`. Firebase is strictly auth-only — no Firestore or Realtime Database.

### TypeScript

All shared interfaces live in `src/types.ts`. Compiler is set to strict mode (`tsconfig.app.json`).
