# Handoff: PocketAce — Poker Management App

## ⚠️ Critical instruction
**Only change the visuals. Do not touch any existing app logic, routing, state management, data models, or backend calls.** The prototype shows the desired UI — map it onto whatever components and screens already exist in the codebase. If a screen doesn't exist yet, create it. If it does exist, restyle it. Never refactor working logic to match the prototype's implementation.

## Overview
PocketAce is a mobile-first poker table management tool for Israeli friend groups. It lets players track buy-ins, chip counts, and settle debts at the end of a game — all in one session. The design is **Hebrew RTL**, dark-themed with a "washed underground" aesthetic: warm charcoal backgrounds, sage green accents, amber/gold for money, and rust red for losses.

## About the Design Files
The files in this bundle are **HTML/React prototypes** — high-fidelity design references built to show exact look, behavior, and interactions. They are **not** production code to copy directly. Your task is to **recreate these designs in your existing app environment** (React Native, Next.js, native iOS/Android, etc.) using its established patterns, navigation libraries, and component systems.

The prototype uses inline Babel + React in a single HTML file for portability. Map the logic and visuals to your stack.

## Fidelity
**High-fidelity.** Colors, typography, spacing, interactions, and copy are all final. Recreate pixel-close using your codebase's design system. If your app already has a design system, defer to it for spacing/radius tokens but match the color palette and typographic hierarchy shown here.

---

## Screens

### 1. Auth Screen (`auth`)
**Purpose:** Email-only login/register. No password field.

**Layout:**
- Full-screen dark background with radial sage glow at top center
- Centered vertically, max-width 340px card
- Large stacked logo above card: "Pocket" + "Ace" in sage green
- Floating suit symbols (♠♣♥♦) in background at ~4% opacity

**Components:**
- **Logo** — Heebo 900, 48px, `#EAEAEA` + `#5E9A70` (sage) for "Ace", letter-spacing -0.04em
- **Subtitle** — 12px uppercase, `rgba(200,190,168,0.38)`, letter-spacing 0.14em
- **Toggle (כניסה / הרשמה)** — Segmented control in `#2E2820` bg, active tab = `#4A7A5A` (sage) with white text, inactive = muted
- **Email input** — IBM Plex Mono 14px, `#2E2820` bg, `rgba(200,190,168,0.08)` border, focus: `#4A7A5A` border + glow
- **Name input** (register only) — same style, `direction: rtl`
- **Submit button** — full width, `#4A7A5A` bg, white text, Heebo 800 15px, 8px radius
- **Card** — `#272118` bg, `rgba(200,190,168,0.08)` border, 10px radius, subtle top gradient line

**Behavior:**
- Toggle between login/register animates field in/out
- Submit shows spinner, then navigates to Lobby
- On register: name field slides in above email

---

### 2. Lobby Screen (`lobby`)
**Purpose:** Home screen. Start a game or view history.

**Layout:**
- Scrollable, full dark bg with faint sage radial glow top
- Padding 24px horizontal

**Components:**
- **Greeting** — "שלום," label (10px muted uppercase) + player name Heebo 900 24px
- **Exit button** — ghost button top-right, 12px
- **Start Game CTA** — full-width, Heebo 900 18px, `#4A7A5A`, "♠ התחל משחק חדש"
- **Stats row** — 3-column surface card: games played / total profit (sage) / win % (gold `#C49A2C`)
- **History list** — surface cards with right border: `#4A7A5A` for wins, `#8A4A2A` for losses. Player names + date + pot + P&L in mono

**State:** Reads from game history array (date, players[], pot, result)

---

### 3. Game Setup Screen (`setup`)
**Purpose:** Configure buy-in amount and add players before starting.

**Layout:**
- Full dark screen, scrollable, fixed footer with CTA

**Components:**
- **Back button** — ← mono, muted, top left
- **Buy-in stepper** — `−` / `+` circular buttons (38×38, `#2E2820`), center amount in IBM Plex Mono 40px gold `#C49A2C`
- **Quick-select pills** — ₪100 / ₪200 / ₪500 / ₪1000. Active: gold border + bg, inactive: dashed border
- **Player rows** — surface cards with right sage border. Index in gold mono, name input transparent/borderless inside row, × to remove
- **Add player button** — ghost dashed border, full width
- **Start button** — fixed footer, full width, `#4A7A5A`, disabled at < 2 players

---

### 4. Game Table Screen (`table`)
**Purpose:** Main game view — shows timer, pot, each player's stack and buy-ins.

**Layout:**
- Dark screen with faint sage radial glow
- Fixed header (clock + pot), scrollable player list, fixed footer (end game)

**Components:**
- **Clock** — IBM Plex Mono 58px, `#5E9A70`, centered, bold. Label "זמן משחק" above in 10px muted
- **Pot** — IBM Plex Mono 19px gold `#C49A2C`, below clock left-aligned
- **Player rows** — 4-column grid: chip stack | name+buyins | balance | +קנייה button
  - First player gets gold `#C49A2C` name color + gold right border
  - Others: sage right border
- **Chip stack** (see Chip Stack section below)
- **+קנייה button** — ghost, amber border `rgba(196,154,44,0.2)`, amber text, instantly adds one buy-in (NO confirmation)
- **End game button** — full width, rust `#8A4A2A`, fixed at bottom, "סגור שולחן"
- **End confirm modal** — blurred overlay, surface card, "לסגור את השולחן?" with continue/close buttons

#### Chip Stack Component
Each player has a **unique color palette** (one hue, multiple shades):
- Player 0: Reds `#C44B30` → `#E05A3A` → `#A03820` → ...
- Player 1: Greens `#2A5C38` → `#3A7A4C` → ...
- Player 2: Blues `#1A3A8A` → `#2A4EAA` → ...
- Player 3: Purples `#7A3A8A` → `#9A4EAA` → ...
- Player 4: Golds `#B87A10` → `#D49020` → ...
- Player 5: Teals `#2A7A8A` → `#3A9AAA` → ...

Chips are 30×30px circles stacked vertically (5px offset each), max 6 shown. Each disc has a **subtle pseudo-random horizontal wobble (±1.5px) and rotation (±2°)** seeded by `(playerIndex * 7 + chipIndex * 13) % 17` so it's deterministic and doesn't shift on re-render. Top chip shows ♠ symbol.

---

### 5. Chip Count Screen (`endgame`)
**Purpose:** After game ends, enter each player's final chip count.

**Layout:**
- Dark screen, scrollable, fixed footer

**Components:**
- **Validation bar** — surface card showing: שולחן total | status (✓ תקין / פער +N) | הוזן total. Border color transitions green/rust based on validity
- **Player rows** — name + buy-in info, then − / number input / + controls. Input labeled "צ'יפים" below
- **Calculate button** — gold gradient, disabled until all filled AND sum matches pot exactly
- **Important:** inputs are in **chips** not ₪. The chip-to-shekel conversion only happens in results.

---

### 6. Results Screen (`results`)
**Purpose:** Show final P&L, crown the winner, show who owes who.

**Layout:**
- Scrollable, amber radial glow top
- Header: "תוצאות 🃏" + pot badge
- Player cards sorted by profit descending
- Debt settlement section below

**Components:**
- **Player cards** — sorted by profit. Top player: gold border + gold name + "כריש 🦈" badge. Winners: sage. Losers: rust
- **P&L numbers** — IBM Plex Mono 800. Top player 29px, others 22px. Color: gold / sage / rust
- **Debt rows** — "from → ₪amount → to" with gradient divider lines
- **Play again button** — sage, triggers confetti burst + navigate to lobby

**Confetti:** 22 pieces, colors from palette, mix of circles and squares, 1.4s fall animation

---

## Interactions & Animations

| Interaction | Behavior |
|---|---|
| Screen transition | `slide-up` 0.32s ease — opacity 0→1, translateY 16→0 |
| Modal appear | `scale-in` 0.2s ease — scale 0.94→1 |
| Player row stagger | `slide-up` with `${i * 0.06}s` delay per row |
| Buy-in tap | Instantly increments chips + buyIns, chip stack grows live |
| Timer | `setInterval` 1s, counting up from 0:00 |
| Confetti | 22 divs, `confetti-fall` 1.4s ease-in, staggered delays |
| Validation bar | Border color + text color transition on `allFilled` + `isValid` |

---

## Design Tokens

### Colors
```
--bg0:     #1A1614   /* deepest bg */
--bg1:     #201C18
--bg2:     #272118   /* surface cards */
--bg3:     #2E2820   /* inputs, elevated */
--bg4:     #362E24

--paper:   #C8BEA8   /* primary text */
--muted:   rgba(200,190,168,0.38)
--dimmer:  rgba(200,190,168,0.14)

--sage:    #4A7A5A   /* primary accent — CTAs, win borders */
--sage2:   #5E9A70   /* lighter sage — timer, chip balance */
--sage-bg: rgba(74,122,90,0.12)

--rust:    #8A4A2A   /* danger — loss borders, end game */
--rust2:   #A85A38
--rust-bg: rgba(138,74,42,0.12)

--gold:    #C49A2C   /* money — pot, buy-in, top player */
--border:  rgba(200,190,168,0.08)
--borderA: rgba(200,190,168,0.18)
```

### Typography
```
Display/Names:  Heebo 900, letter-spacing -0.02em
Body/Labels:    Heebo 400–700
Numbers/Mono:   IBM Plex Mono 400–700
```

### Spacing / Radius
```
Screen padding:  18–24px
Card padding:    13–18px
Border radius:   10px (cards), 7–8px (inputs/buttons), 50% (chips)
Border (right accent): 3px solid
```

### Shadows
```
Cards:    0 4px 24px rgba(0,0,0,0.3)
Chips:    0 2px 5px rgba(0,0,0,0.35) + inset 0 1px 0 rgba(255,255,255,0.12)
Sage btn: 0 3px 16px rgba(74,122,90,0.18)
Rust btn: 0 3px 14px rgba(138,74,42,0.16)
```

### Background texture
Diagonal repeating lines at 45°, `rgba(200,190,168,0.35)` 1px every 6px, opacity 0.04 overall. Gives "faded film" grain.

---

## State Shape

```js
// Game object
{
  players: [{ id, name, chips, buyIns }],
  buyIn: number,  // ₪ per buy-in
}

// Results
players.map(p => ({
  ...p,
  finalChips: number,   // chips entered in count screen
  profit: finalChips - buyIns * buyIn,  // ₪ P&L
}))

// Debt settlement: greedy matching algorithm
// Sort winners desc, losers desc, match min(winner.rem, loser.rem)
```

---

## Screen Flow
```
auth → lobby → setup → table → endgame → results → lobby
```

---

## Files in This Bundle
- `PocketAce.html` — full working prototype, all 6 screens
- `PocketAce – Direction 3 Saved.html` — earlier visual direction (saved reference)
- `Full App Directions.html` — design exploration canvas (3 directions × 3 screens)
- `Auth Options.html` — auth screen exploration (4 options)

---

## RTL Notes
- All screens are `direction: rtl`
- Inputs that contain email/numbers use `dir="ltr"` with `text-align: right`
- Right border accent on cards (instead of left)
- Navigation arrows point ← (back) in RTL context
