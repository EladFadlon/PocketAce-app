# ♠️ Pocket Ace

**A mobile-first app for running home poker games with friends: track buy-ins, count chips, and settle up in the fewest transfers possible.**

At the end of a home game someone always ends up with a notebook and a calculator, working out who owes whom. Pocket Ace does that part. You set the table, tap "+ buy-in" during the game, enter final chip counts, and get a payment list ready to share in WhatsApp.

Built with React 19 + TypeScript. Ships as a **PWA**, an **Android** app and an **iOS** app from a single codebase (Capacitor). Hebrew, right-to-left UI.

<!-- Add 2–3 screenshots here, e.g.:
<p align="center">
  <img src="docs/screenshots/lobby.png" width="230" />
  <img src="docs/screenshots/table.png" width="230" />
  <img src="docs/screenshots/results.png" width="230" />
</p>
-->

---

## Features

- **Table setup:** set the price per buy-in (₪) and the number of chips per buy-in, then add players.
- **Live game tracking:** one-tap re-buys per player, with a running total of money on the table.
- **End-of-game chip count:** enter each player's final stack; profit/loss is computed automatically.
- **Debt settlement:** turns everyone's net result into a short list of "X pays Y ₪" transfers.
- **WhatsApp summary:** generates a formatted game summary (winner, biggest loser, who pays whom) and opens it in WhatsApp.
- **Regulars:** save your usual crew and start a new game by tapping names.
- **Game history and stats:** the last 100 games are stored per user, with cumulative profit/loss and a status badge.
- **Crash-safe:** the in-progress game is saved continuously, so closing the app or refreshing mid-game loses nothing.
- **Installable:** works offline as a PWA and as a native Android/iOS app.

## Tech Stack

| Area | Technology |
|---|---|
| UI | React 19, TypeScript (strict mode) |
| Build | Vite |
| Animation | Framer Motion |
| Mobile | Capacitor (Android and iOS), vite-plugin-pwa (service worker, offline support) |
| Storage | Browser `localStorage`, no backend |
| Hosting | Firebase Hosting |
| Tooling | ESLint, typescript-eslint |

## How It Works

### Settlement algorithm

The core logic lives in [`src/utils/settlements.ts`](src/utils/settlements.ts).

1. **Profit/loss per player:**
   `(finalChips − buyIns × chipsPerBuyIn) / chipsPerBuyIn × pricePerBuyIn`
2. **Integer money math:** all amounts are converted to agorot (₪ × 100) and handled as integers, so there is no floating-point drift (no `0.1 + 0.2` errors on someone's debt).
3. **Debt minimization:** players are split into creditors and debtors, each sorted by amount. A greedy two-pointer pass matches the largest debtor with the largest creditor, transfers `min(debt, credit)`, and advances whichever side reaches zero. This yields **at most n − 1 transfers** for n players, in O(n log n) time.

```
Alice +150   Bob +50   Carol −120   Dave −80
→ Carol pays Alice 120
→ Dave pays Alice 30
→ Dave pays Bob 50
```

### App architecture

- **Phase-based navigation.** Instead of a router, `App.tsx` holds a single state machine:
  `AUTH → LOBBY → SETUP → TABLE → END_GAME → RESULTS → LOBBY`.
  Each phase renders one full-screen component.
- **Single source of truth.** All game state lives in `App.tsx` and flows down through props.
- **Persistence layer.** [`src/utils/storage.ts`](src/utils/storage.ts) wraps all `localStorage` access: the active game snapshot, user session, per-user game history (capped at 100) and the regulars list.
- **Shared types.** All interfaces are in [`src/types.ts`](src/types.ts).

## Getting Started

**Prerequisites:** Node.js 20.19+ (or 22+) and npm.

```bash
git clone https://github.com/EladFadlon/PocketAce-app.git
cd PocketAce-app
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

### Running on Android / iOS

```bash
npm run build
npx cap sync
npx cap open android   # opens Android Studio
npx cap open ios       # opens Xcode (macOS only)
```

## Project Structure

```
src/
├── App.tsx              # State machine and top-level game state
├── types.ts             # Shared TypeScript interfaces
├── components/          # One full-screen component per phase
│   ├── Auth.tsx
│   ├── Lobby.tsx        # Regulars, history, start game
│   ├── GameSetup.tsx    # Buy-in price, chips, players
│   ├── GameTable.tsx    # Live game: re-buys
│   ├── EndGame.tsx      # Final chip counts
│   └── SettlementResults.tsx
├── utils/
│   ├── settlements.ts   # P&L calculation, debt minimization, WhatsApp text
│   ├── gameHistory.ts   # Game records and cumulative stats
│   ├── storage.ts       # localStorage access layer
│   └── regulars.ts      # Saved player list
└── styles/              # Per-component CSS and design tokens
android/  ios/           # Capacitor native projects
```

## Roadmap

- [ ] Cloud sync and shared game history across devices
- [ ] Unit tests for the settlement logic
- [ ] Premium features

## Author

**Elad Fadlon**, Computer Science student at Ben-Gurion University
[GitHub](https://github.com/EladFadlon)
