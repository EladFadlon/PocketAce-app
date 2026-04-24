# Results Screen Animations — Design Spec

**Date:** 2026-04-24  
**Status:** Approved

## Goal

Upgrade the SettlementResults screen with entrance animations and a more dramatic winner moment. The screen currently feels flat and static — the winner card blends in with the player rows. This spec adds a celebration animation sequence and a winner insult pool.

## Animation Sequence

The screen animates in a top-to-bottom cascade on mount. Total sequence duration: ~2s.

| Timing | Element | Animation |
|--------|---------|-----------|
| 0.2s | Winner card | Spring pop-in: `scale(0.85) translateY(16px) → scale(1) translateY(0)`, `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| 0.3s | Confetti | Burst from top of screen, 50 pieces, colors from brand palette, fade out after ~1s |
| 0.45s | Winner avatar | Rotation bounce: `rotate(-15deg) scale(0.4) → rotate(0) scale(1)` |
| 0.85s | Winner amount | Fade up: `translateY(8px) opacity(0) → translateY(0) opacity(1)` |
| 1.1s | Winner insult | Fade up (same as amount) |
| 1.1–1.4s | Player rows | Staggered slide-in from left (`translateX(-14px) → translateX(0)`), 100ms apart each |
| 1.55s | Debts section label | Fade up |
| 1.6s+ | Debt cards | Staggered fade-up, 120ms apart |
| ~1.84s | WhatsApp button | Fade up last |

All animations use CSS `animation` with `both` fill-mode so elements start invisible and stay visible after animating in.

## Winner Hero Card Changes

The winner card gains two new elements inside it:

1. **Winner amount** — already exists, now animated
2. **Winner insult** — new line below the amount, separated by `border-top: 1px solid rgba(46,204,113,0.15)`. Font: 9px italic, `rgba(255,255,255,0.5)`. Pulled from `getWinnerInsult(winner.name)`.

No layout or sizing changes to the card itself.

## Winner Insults

New file: `src/utils/winnerInsults.ts`

- 15 Hebrew sentences, funny and lightly stinging (same tone as loser insults)
- Same shuffle-queue pattern: shuffled array stored in `localStorage` under `pocketAce_winnerInsults`, consumed one at a time, reshuffled when exhausted
- Exported as `getWinnerInsult(name: string): string`
- `{name}` placeholder replaced at call time

File already created as part of brainstorming.

## Confetti Implementation

Canvas element absolutely positioned over the phone screen (`position: absolute; inset: 0; pointer-events: none; z-index: 10`). Drawn with `requestAnimationFrame`. Pieces fade out after ~60 frames. Canvas clears itself when all pieces are gone.

Colors: `#f5c518` (yellow), `#2ecc71` (green), `#3498db` (blue), `#e74c3c` (red), `#9b59b6` (purple).

Implementation: vanilla canvas in a React `useEffect` that fires once on mount.

## What Does Not Change

- Screen layout, spacing, padding
- Colors and design tokens
- RTL direction
- Footer buttons (always visible, no animation)
- Loser insult (below the player list, unchanged)
- Debt card and WhatsApp card visual design

## Files Changed

| File | Change |
|------|--------|
| `src/components/SettlementResults.tsx` | Add animation classes, confetti canvas + useEffect, import `getWinnerInsult` |
| `src/styles/results.css` | Add animation keyframes and animated element states |
| `src/utils/winnerInsults.ts` | New file (already created) |
