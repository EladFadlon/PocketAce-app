# PocketAce UX/UI Redesign — Design Spec
Date: 2026-04-18

## Overview

Full visual redesign of PocketAce — a Hebrew-language poker game manager for friend groups. The redesign targets a "hood"/street aesthetic aimed at groups of friends playing together casually.

**Stack:** React + TypeScript + Vite, Framer Motion, RTL (Hebrew)  
**Approach:** Screen-by-screen TSX + CSS rewrite, preserving all logic in `App.tsx` and `utils/`

---

## Design Language

### Visual Style
- **Theme:** "Crew/Social" — urban, modern, casual. Built for friends, not a casino floor.
- **Color system:**
  - Background: `#080810` (near-black with blue tint)
  - Primary accent: `#f5c518` / `#d4a017` (yellow-gold)
  - Per-player colors: Red `#e74c3c`, Blue `#3498db`, Green `#2ecc71`, Purple `#9b59b6`, Orange `#ff6b35` (assigned per player slot)
  - Success: `#2ecc71`, Danger: `#e74c3c`
  - Text: `#fff` primary, `rgba(255,255,255,0.3)` secondary, `rgba(255,255,255,0.15)` dim
- **Glassmorphism cards:** `background: linear-gradient(145deg, rgba(COLOR, 0.15), rgba(COLOR, 0.04))` + `border: 1px solid rgba(COLOR, 0.35)` + `backdrop-filter: blur(4px)`
- **Glow effects:** `box-shadow: 0 4px 16px rgba(COLOR, 0.45)` on avatars, `0 6px 28px rgba(245,197,24,0.4)` on primary CTA
- **Border radius:** 14–18px on cards, 12px on inputs, 20–24px on pill buttons
- **Typography:** `font-family: -apple-system, 'Heebo', sans-serif` — RTL throughout
- **Navigation:** Fullscreen phase-based flow (no persistent tab bar). Each screen occupies the full viewport.

### Tagline
> **"תן לקלפים לדבר בשבילך ♠"**

### Tone
Hebrew throughout, casual street slang. Key copy:
- CTA: "בוא נשחק 🤙", "פותחים שולחן 🃏", "יאללה, מתחילים! 🚀"
- Forgot password: "קליק כאן אחי"
- Sign up: "פתח חשבון — זה שניה"
- End game: "חשב מי חייב למי 🧮"
- Play again: "משחק נוסף? יאללה 🃏"

---

## Screens

### 1. Auth
**File:** `src/components/Auth.tsx` + `src/styles/auth.css`

**Layout:**
- Full-screen dark background with radial yellow glow behind logo
- Centered logo: 84×84px rounded square card (glassmorphism, yellow border), ♠ at 40px
- App name "Pocket Ace" at 28px/900 weight
- Tagline: "תן לקלפים לדבר בשבילך ♠" in yellow-tinted text
- Tab switcher (כניסה / הרשמה) — active tab filled yellow, inactive transparent
- Two inputs: phone + password, glassmorphism style, yellow border on focus
- Primary CTA: full-width yellow gradient button "בוא נשחק 🤙"
- Forgot password: "קליק כאן אחי" in dim yellow
- Register hint: "פתח חשבון — זה שניה"

---

### 2. Lobby
**File:** `src/components/Lobby.tsx` + `src/styles/lobby.css`

**Layout (top to bottom):**
1. **Top bar:** User avatar initial (yellow circle) + name greeting + credits pill (⚡ N קרדיטים)
2. **Stats row (3 cards):** סה"כ רווח (green) | מספר משחקים | סטטוס badge (🦈/🐟/⭐)
3. **"החבר׳ה הקבועים"** — row of colored circular avatars (emoji-based) + "הוסף" dashed circle
4. **Primary CTA:** Full-width yellow button "פותחים שולחן 🃏" + subtitle "עולה קרדיט אחד"
5. **משחקים אחרונים** — list of recent games with date, player count, win/loss amount
6. **Credits store teaser** — yellow-tinted banner "נגמרו הקרדיטים?" with "חנות" button
7. **Bottom:** Subtle "התנתק" link

---

### 3. GameSetup
**File:** `src/components/GameSetup.tsx` + `src/styles/setup.css`

**Layout:**
- Header: "הגדרת שולחן 🃏" + back button
- **Buy-in settings (2 cards side by side):**
  - ₪ לכל buy-in — stepper with −/+ controls
  - ז׳יטונים לכל buy-in — stepper with −/+ controls
  - Live rate display: "1 ז׳יטון = X₪" in yellow-tinted pill
- **שחקנים section:**
  - Host row: yellow-tinted card with 👑 badge
  - Each added player: colored avatar + name + ✕ remove
  - Add player: dashed border input row
- **Bottom CTA:** "יאללה, מתחילים! 🚀"

**Terminology:** "צ'יפ/צ'יפים" → "ז׳יטון/ז׳יטונים" throughout

---

### 4. GameTable
**File:** `src/components/GameTable.tsx` + `src/styles/table.css`

**Layout:**
- Header: "שולחן פעיל" label + total pot amount
- **Player grid (2 columns):**
  - Each player card: glassmorphism with player's unique color
  - Avatar (colored circle + emoji) with glow
  - Name + buy-in count badge (top-right)
  - Buy-in dots indicator (filled = bought, empty = available)
  - Amount in player color
  - "+ Buy In" button in player's gradient color
  - 🔥 indicator on count badge when ×3 or more buy-ins
  - 👑 badge for host
- **"+ הוסף שחקן"** dashed add card
- **Bottom bar:** "יציאה" (ghost) + "סיים משחק 🏁" (yellow, 2× flex)

---

### 5. EndGame
**File:** `src/components/EndGame.tsx` + `src/styles/endgame.css`

**Layout:**
- Header: "כמה ז׳יטונים יש לך? 🏁" + back button
- Total ז׳יטונים reminder pill (yellow-tinted)
- **Per-player input rows:** colored card with avatar + invested amount + −/number/+ stepper in player color
- **Live validation:** when sum equals total, show green "✅ מדויק!" indicator
- **Bottom CTA:** "חשב מי חייב למי 🧮"

---

### 6. SettlementResults
**File:** `src/components/SettlementResults.tsx` + `src/styles/results.css`

**Layout:**
1. **Header:** "תוצאות המשחק 🏆" + game summary (date, players, pot)
2. **Winner hero card:** green glassmorphism, big avatar, name, tonight's profit + season total
3. **All players list:** compact rows with colored avatar + name + profit/loss in green/red
4. **"מי חייב למי 💸" section:** debt cards showing payer → receiver + amount in yellow
5. **Loser insult:** random message from pool targeting the biggest loser (see below)
6. **WhatsApp share button:** green-tinted card "שתף לווצאפ" 💬
7. **Bottom:** "לובי 🏠" (ghost) + "משחק נוסף? יאללה 🃏" (yellow)

**Loser insult pool** (random shuffle, no repeats until exhausted):
- "דני, אחי... הקלפים דיברו. 🃏😬"
- "דני שילם את הכיבוד לכולם. תודה אחי 🙏"
- "דני — המפסיד הרשמי. יש פעם הבאה אחי 😅"
- "דני, הפוקר לא עבורך הערב 😂 תחזור חזק"
- *(+ additional messages in same tone added during implementation)*

---

## Modals

Existing modals (WelcomeGift, CreditConfirmation, GameOver, Store) to be restyled to match the new design language:
- Dark glassmorphism background overlay
- Yellow accent on primary actions
- Same border-radius and typography system
- Consistent with screen designs above

---

## Implementation Notes

- All existing logic in `App.tsx`, `utils/`, and `types.ts` stays untouched
- Only `src/components/*.tsx` and `src/styles/*.css` files are rewritten
- Per-player color assignment: deterministic by player index (slot 0=red, 1=blue, 2=green, 3=purple, 4=orange, etc.)
- Loser insult: stored in a shuffled array in `utils/`, persisted to `localStorage` to avoid repeats across sessions
- WhatsApp share: `window.open('https://wa.me/?text=...')` with formatted debt summary
- All existing Firebase, auth, credits, and game history logic preserved
