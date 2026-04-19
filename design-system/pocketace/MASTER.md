# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pocketace/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** PocketAce — Hebrew-language poker game manager
**Last synced:** 2026-04-19 (hood/crew redesign, branch `feat/ux-ui-redesign`)
**Category:** Casual Social Gaming / Poker Utility
**Aesthetic:** Hood · Crew · Street · Glassmorphism on near-black
**Source of truth:** `src/index.css` (design tokens) + per-screen CSS in `src/styles/`

---

## Global Rules

### Color Palette

#### Core tokens (from `src/index.css`)

| Role | Hex / rgba | CSS Variable |
|------|-----------|--------------|
| Background — primary | `#080810` | `--bg-primary` |
| Background — secondary | `#0d0d18` | `--bg-secondary` |
| Background — card | `rgba(255,255,255,0.03)` | `--bg-card` |
| Background — glass | `rgba(255,255,255,0.04)` | `--bg-glass` |
| Text — primary | `#ffffff` | `--text-primary` |
| Text — secondary | `rgba(255,255,255,0.4)` | `--text-secondary` |
| Text — dim | `rgba(255,255,255,0.15)` | `--text-dim` |
| Accent — yellow | `#f5c518` | `--yellow` |
| Accent — yellow dark | `#d4a017` | `--yellow-dark` |
| Accent — yellow glow | `rgba(245,197,24,0.4)` | `--yellow-glow` |
| Accent — yellow glass | `rgba(245,197,24,0.1)` | `--yellow-glass` |
| Accent — yellow border | `rgba(245,197,24,0.3)` | `--yellow-border` |
| Semantic — win | `#2ecc71` | `--green` |
| Semantic — loss / danger | `#e74c3c` | `--red` |
| Border (neutral) | `rgba(255,255,255,0.07)` | `--border` |

**Color notes:** Near-black base (tinted blue, not pure black) + single warm yellow accent for money/CTA/identity. Reds and greens reserved for win/loss semantics only — never decorative.

#### Per-player colors (slot-indexed)

Assigned deterministically by player index (0–5). Used across `GameSetup`, `GameTable`, `EndGame`, `SettlementResults`. **Currently duplicated in 4 components — extract to `src/utils/playerColors.ts` when touched next.**

| Slot | Name | Gradient (bg) | Text | Border | Glow |
|------|------|---------------|------|--------|------|
| 0 | Red | `linear-gradient(135deg,#e74c3c,#c0392b)` | `#e74c3c` | `rgba(231,76,60,0.35)` | `rgba(231,76,60,0.45)` |
| 1 | Blue | `linear-gradient(135deg,#3498db,#2980b9)` | `#3498db` | `rgba(52,152,219,0.35)` | `rgba(52,152,219,0.45)` |
| 2 | Green | `linear-gradient(135deg,#2ecc71,#27ae60)` | `#2ecc71` | `rgba(46,204,113,0.35)` | `rgba(46,204,113,0.45)` |
| 3 | Purple | `linear-gradient(135deg,#9b59b6,#8e44ad)` | `#9b59b6` | `rgba(155,89,182,0.35)` | `rgba(155,89,182,0.45)` |
| 4 | Orange | `linear-gradient(135deg,#ff6b35,#e55a24)` | `#ff6b35` | `rgba(255,107,53,0.35)` | `rgba(255,107,53,0.45)` |
| 5 | Amber | `linear-gradient(135deg,#f39c12,#d68910)` | `#f39c12` | `rgba(243,156,18,0.35)` | `rgba(243,156,18,0.45)` |

Card background pattern: `linear-gradient(145deg, rgba(COLOR,0.15), rgba(COLOR,0.05))` + 0.35α border + optional 0.45α box-shadow glow for active/hero states.

---

### Typography

- **Primary font:** `Inter` (weights 300–900)
- **Hebrew fallback:** `Heebo`, `Assistant`
- **System fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Direction:** RTL globally (`html { direction: rtl; text-align: right; }`)
- **Base font-size:** 16px (never shrink below — iOS auto-zoom trap)
- **Headings:** `font-weight: 700`, `letter-spacing: -0.3px`, no default margin
- **Mood:** Confident · Street · Casual-poker · Hebrew-first

**CSS Import (already in `src/styles/fonts.css`):**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&family=Assistant:wght@400;700&display=swap');
```

---

### Layout & Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--touch` | `48px` | Minimum tap target (buttons, inputs, steppers) |
| `--radius-sm` | `10px` | Chips, small pills, tight controls |
| `--radius-md` | `14px` | Buttons, inputs, small cards |
| `--radius-lg` | `18px` | Main cards, modal bodies |
| `--radius-xl` | `24px` | Hero elements, pill buttons |
| `--safe-top/bottom/left/right` | `env(safe-area-inset-*)` | iOS notch / home indicator handling |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 8px 32px rgba(0,0,0,0.55)` | Every glassmorphism card |
| `--shadow-yellow` | `0 6px 28px rgba(245,197,24,0.4)` | Primary CTA glow |

(No full shadow-sm/md/lg/xl scale — this is a dark-UI single-elevation system.)

---

## Component Specs

### Glassmorphism Card (core pattern)

```css
.glass {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--yellow-border);
  border-radius: var(--radius-lg);
}
```

For player-colored cards, swap the background/border to the slot color's gradient + 0.35α border.

### Buttons

```css
/* Global base — applies to every <button> */
button {
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  border-radius: var(--radius-md);
  min-height: var(--touch);
  touch-action: manipulation;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.12s, transform 0.1s;
}
button:active:not(:disabled) { opacity: 0.82; }
button:disabled              { opacity: 0.35; cursor: not-allowed; pointer-events: none; }

/* Primary CTA */
.btn-primary {
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #080810;
  box-shadow: var(--shadow-yellow);
}

/* Ghost / secondary */
.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

### Inputs

```css
input, textarea, select {
  direction: rtl;
  text-align: right;
  font-family: inherit;
  font-size: 16px;
  min-height: var(--touch);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus {
  border-color: var(--yellow);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.14);
}
input::placeholder { color: var(--text-dim); }
```

### Modals

Dark glass overlay + card stacked on near-black. See `src/components/modals/modals.css` for the current implementation.

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
}
.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--yellow-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 24px;
  max-width: 440px;
  width: calc(100% - 32px);
}
```

### Scroll containers

```css
.scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar { display: none; }
```

---

## Motion

All screen-level transitions use **Framer Motion**. Required for:
- Every phase transition (`AnimatePresence` + `motion.div`)
- Modal open/close (scale + fade, 150–300ms)
- Number counters (animate on value change)
- Success / win states (confetti + bounce-in)

**Standard screen entrance:**
```ts
const screenVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -24, transition: { duration: 0.2 } }
};
```

**Keyframe utilities** (in `src/index.css`): `pulse-glow`, `float`, `slideUp`, `fadeIn`, `spin`, `bounce-in`.

Always respect `prefers-reduced-motion` — wrap variants conditionally on `useReducedMotion()`.

---

## Voice & Tone

Hebrew throughout, **casual street slang**, poker-flavored.

| Context | Copy pattern |
|---------|--------------|
| Primary CTA | "בוא נשחק 🤙", "פותחים שולחן 🃏", "יאללה, מתחילים! 🚀" |
| End game | "חשב מי חייב למי 🧮" |
| Winner | "כריש 🦈", "שחיטה טהורה 💰" |
| Loser | "תרומה לקהילה 🐟", "דג של הערב" |
| Forgot password | "קליק כאן אחי" |
| Register | "פתח חשבון — זה שניה" |
| Play again | "משחק נוסף? יאללה 🃏" |
| Tagline | "תן לקלפים לדבר בשבילך ♠" |

**Emoji policy:** Emojis are a **core brand element** here — they carry the hood/crew tone. Use them in copy, avatars, and badges. Do NOT replace them with SVG icons.

---

## Player Emojis (avatar pool)

```ts
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];
```

Assigned by slot index in parallel with `PLAYER_COLORS`.

---

## Layout Pattern

**Fullscreen phase-based flow** — no persistent nav bar, no tabs. Each phase (`AUTH → LOBBY → SETUP → TABLE → END_GAME → RESULTS`) owns the full viewport. Phase transitions are driven from `App.tsx` via callback props.

- Header bar: fixed top, respects `--safe-top`
- Content: `.scroll-area` with hidden scrollbar
- Bottom CTA bar: fixed, respects `--safe-bottom`

---

## Anti-Patterns (Do NOT Use)

- ❌ **Pure black `#000` backgrounds** — use `#080810` (tinted)
- ❌ **Bright white cards** — everything sits on dark
- ❌ **Multiple accent colors** — yellow is the only CTA color; red/green are semantic only
- ❌ **Tap targets under 48px** — breaks one-handed play
- ❌ **Hover-only interactions** — this is a phone-first app
- ❌ **Skipping the Framer Motion entrance** — every screen must animate in
- ❌ **Hardcoded colors in components** — reference CSS vars from `index.css` or the `PLAYER_COLORS` table
- ❌ **Floating `process.env.*`** — use `import.meta.env.VITE_*` (Vite)
- ❌ **Low contrast text on dark glass** — maintain 4.5:1 minimum
- ❌ **Instant state changes** — always 150–300ms transitions
- ❌ **Replacing emojis with SVG icons** — emojis are intentional brand voice

---

## Pre-Delivery Checklist

Before shipping any UI code, verify:

- [ ] All colors reference `var(--*)` from `src/index.css` (no raw hex)
- [ ] Every button has `min-height: var(--touch)` (48px)
- [ ] Every input has `font-size: 16px` (prevents iOS auto-zoom)
- [ ] RTL respected: `margin-inline` instead of `margin-left/right` where possible
- [ ] Framer Motion entrance on screen mount
- [ ] `prefers-reduced-motion` branch present for animations
- [ ] Responsive: tested 375px, 390px, 414px, 430px widths (no desktop-first)
- [ ] Safe-area insets on any fixed top/bottom bar
- [ ] No hardcoded `#000` or `#fff` — use tokens
- [ ] Hebrew copy reviewed for street-tone consistency
- [ ] Every clickable has `cursor: pointer`
- [ ] Focus states visible for keyboard (yellow border + 3px soft glow)
