# Results Screen Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the SettlementResults screen with a top-to-bottom celebration cascade, a dramatic winner hero, confetti, and a winner insult line inside the winner card.

**Architecture:** All animations are pure CSS (`@keyframes` + `animation` property with `fill-mode: both`) so elements are invisible before their cue and stay visible after. Confetti is a vanilla canvas `useEffect` that fires once on mount. The winner insult is pulled from an already-created utility (`src/utils/winnerInsults.ts`).

**Tech Stack:** React 19, TypeScript, CSS custom properties (no new dependencies — framer-motion already present but not used for this feature)

---

## File Map

| File | Action |
|------|--------|
| `src/styles/results.css` | Add `@keyframes` and per-element animation rules |
| `src/components/SettlementResults.tsx` | Add canvas ref + `useEffect` for confetti, add animation class names, render winner insult |
| `src/utils/winnerInsults.ts` | Already created — no changes needed |

---

### Task 1: Add CSS keyframes and animation utility classes

**Files:**
- Modify: `src/styles/results.css`

- [ ] **Step 1: Append keyframes and animation classes to results.css**

Open `src/styles/results.css` and append the following block at the very end of the file:

```css
/* ─── ANIMATIONS ────────────────────────────────────── */
@keyframes res-pop-in {
  from { opacity: 0; transform: scale(0.85) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}

@keyframes res-avatar-bounce {
  from { opacity: 0; transform: rotate(-15deg) scale(0.4); }
  to   { opacity: 1; transform: rotate(0deg)   scale(1);   }
}

@keyframes res-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}

@keyframes res-slide-in {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0);     }
}

/* winner card — spring pop */
.results-winner {
  opacity: 0;
  animation: res-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

/* winner avatar — rotation bounce */
.results-winner-avatar {
  opacity: 0;
  animation: res-avatar-bounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both;
}

/* winner amount — fade up */
.results-winner-amount {
  opacity: 0;
  animation: res-fade-up 0.4s ease 0.85s both;
}

/* winner insult — fade up */
.results-winner-insult {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(46, 204, 113, 0.15);
  font-size: 9px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
  opacity: 0;
  animation: res-fade-up 0.4s ease 1.1s both;
}

/* player rows — staggered slide-in (delay set via inline style in JSX) */
.results-player-row {
  opacity: 0;
  animation: res-slide-in 0.35s ease both;
}

/* debts section label — fade up */
.results-debts-label {
  opacity: 0;
  animation: res-fade-up 0.3s ease 1.55s both;
}

/* debt cards — staggered fade-up (delay set via inline style in JSX) */
.results-debt-card {
  opacity: 0;
  animation: res-fade-up 0.35s ease both;
}

/* whatsapp button — fade up last */
.results-whatsapp {
  opacity: 0;
  animation: res-fade-up 0.35s ease 1.84s both;
}

/* confetti canvas */
.results-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}
```

- [ ] **Step 2: Verify the app still builds**

```bash
npm run build
```

Expected: build succeeds, no TypeScript errors. The results screen will look broken (invisible elements) until Task 2 wires up the JSX — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/styles/results.css
git commit -m "feat: add results screen animation keyframes and CSS classes"
```

---

### Task 2: Add winner insult + confetti canvas to SettlementResults

**Files:**
- Modify: `src/components/SettlementResults.tsx`

- [ ] **Step 1: Add the import and canvas ref**

At the top of `src/components/SettlementResults.tsx`, add the import for `getWinnerInsult` and `useRef`:

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PlayerSettlement, Debt, GameSettings, User } from '../types';
import { generateWhatsAppMessage, getWhatsAppShareURL } from '../utils/settlements';
import { getLoserInsult } from '../utils/loserInsults';
import { getWinnerInsult } from '../utils/winnerInsults';
import { getRegulars, addRegular } from '../utils/regulars';
import '../styles/results.css';
```

- [ ] **Step 2: Add canvas ref and confetti useEffect**

Inside the component, after the existing `useState` and variable declarations (after the `loserInsult` line), add:

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLORS = ['#f5c518', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];
  const pieces = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 30,
    w: 3 + Math.random() * 4,
    h: 5 + Math.random() * 5,
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 7,
    vy: 1.4 + Math.random() * 1.8,
    vx: (Math.random() - 0.5) * 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 1,
  }));

  let frame = 0;
  let rafId: number;

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.rotV;
      if (frame > 50) p.opacity -= 0.016;
      if (p.y < canvas.height && p.opacity > 0) alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (alive) rafId = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const timer = setTimeout(() => { rafId = requestAnimationFrame(tick); }, 300);
  return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
}, []);
```

- [ ] **Step 3: Add winner insult variable**

After the existing `loserInsult` line, add:

```tsx
const winnerInsult = winner && winner.profitLossAfterFee > 0
  ? getWinnerInsult(winner.name)
  : null;
```

- [ ] **Step 4: Add canvas element, winner insult, and inline animation delays to JSX**

Inside the `return`, make the following four changes:

**4a — Add canvas as first child of `<motion.div className="results-screen">`:**

```tsx
<motion.div className="results-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'relative' }}>
  <canvas ref={canvasRef} className="results-confetti" />
  {/* rest of existing JSX unchanged */}
```

**4b — Add winner insult inside the winner card, after `results-winner-amount`:**

```tsx
{winner && winner.profitLossAfterFee > 0 && (
  <div className="results-winner">
    <div className="results-winner-bg">🦈</div>
    <div className="results-winner-avatar">🦈</div>
    <div style={{ flex: 1 }}>
      <div className="results-winner-label">🏆 המנצח הגדול</div>
      <div className="results-winner-name">{winner.name}</div>
      <div className="results-winner-amount">+{winner.profitLossAfterFee.toFixed(0)}₪ הערב</div>
      {winnerInsult && (
        <div className="results-winner-insult">{winnerInsult}</div>
      )}
    </div>
  </div>
)}
```

**4c — Add inline `animationDelay` to player rows in the `.map()` call:**

The `nth-child` approach doesn't work here because the parent also contains a label div. Use `index` from the map instead. Replace the existing player row `<div className="results-player-row" key={s.id}>` opening tag with:

```tsx
<div
  className="results-player-row"
  key={s.id}
  style={{ animationDelay: `${1.1 + index * 0.1}s` }}
>
```

**4d — Add inline `animationDelay` to debt cards in the debts `.map()` call:**

Same issue applies to debt cards. Replace the existing `<div className="results-debt-card" key={i}>` opening tag with:

```tsx
<div
  className="results-debt-card"
  key={i}
  style={{ animationDelay: `${1.6 + i * 0.12}s` }}
>
```

- [ ] **Step 5: Add `results-debts-label` class to the debts section label**

Find this line in the JSX:

```tsx
<div className="results-section-label">מי חייב למי 💸</div>
```

Replace it with:

```tsx
<div className="results-section-label results-debts-label">מי חייב למי 💸</div>
```

- [ ] **Step 6: Build and verify no TypeScript errors**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/SettlementResults.tsx
git commit -m "feat: add confetti, winner insult, and entrance animations to results screen"
```

---

### Task 3: Smoke-test in the browser

**Files:** none (verification only)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Play through a full game and reach the results screen**

Verify the following in order:
1. Winner card pops in with spring bounce at ~0.2s
2. Winner avatar bounces in with rotation at ~0.45s
3. Confetti fires from the top of the screen
4. Winner amount fades up at ~0.85s
5. Winner insult fades up inside the card at ~1.1s (Hebrew, italic, below a subtle green line)
6. Player rows slide in from the left, one by one, starting at ~1.1s
7. Debts section label fades up at ~1.55s
8. Debt cards fade up in sequence
9. WhatsApp button fades up last
10. Footer buttons are always visible (no animation)
11. Loser insult still appears below the player list, unchanged

- [ ] **Step 3: Verify no elements stuck invisible**

Scroll through the full screen. If any element appears permanently invisible (opacity 0), it means the nth-child selector doesn't match — check that the parent container only contains `.results-player-row` or `.results-debt-card` elements as direct children.

- [ ] **Step 4: Commit if any CSS fixes were needed, otherwise done**

```bash
git add -p
git commit -m "fix: adjust animation nth-child selectors for results screen"
```
