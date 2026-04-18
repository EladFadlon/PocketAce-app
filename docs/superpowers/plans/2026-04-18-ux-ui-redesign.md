# PocketAce UX/UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully redesign all 6 screens and modals of PocketAce with a modern "hood/crew" aesthetic — glassmorphism cards, per-player colors, yellow accent on black, Hebrew street slang.

**Architecture:** Screen-by-screen CSS + TSX rewrite. All logic in `App.tsx` and `utils/` is untouched. Each component gets a fresh CSS file and updated JSX structure while keeping all props, state, and event handlers identical.

**Tech Stack:** React 18, TypeScript, Framer Motion, CSS custom properties, RTL Hebrew

**Spec:** `docs/superpowers/specs/2026-04-18-ux-ui-redesign-design.md`

**UX Guidelines (from ui-ux-pro-max):**
- Touch targets: minimum **44×44px** on all buttons and interactive elements
- Touch spacing: minimum **8px gap** between adjacent touch targets
- Animations: **150–300ms** for micro-interactions (Framer Motion whileTap)
- Add `overscroll-behavior: contain` on all scrollable containers
- Add `cursor: pointer` on all clickable elements
- Respect `prefers-reduced-motion` — wrap Framer Motion variants conditionally
- Typography: add **Inter** font alongside Heebo for glassmorphism aesthetic
- No hover-only interactions — all primary actions use `onClick`/`whileTap`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/index.css` | Modify | Design tokens — new color palette, shadows, radii |
| `src/App.css` | Modify | App shell (no change needed, already minimal) |
| `src/utils/loserInsults.ts` | Create | Shuffled insult pool with localStorage persistence |
| `src/styles/auth.css` | Rewrite | Auth screen styles |
| `src/styles/lobby.css` | Rewrite | Lobby screen styles |
| `src/styles/setup.css` | Rewrite | GameSetup screen styles |
| `src/styles/table.css` | Rewrite | GameTable screen styles |
| `src/styles/endgame.css` | Rewrite | EndGame screen styles |
| `src/styles/results.css` | Rewrite | SettlementResults screen styles |
| `src/styles/modals.css` | Rewrite | Modal overlay + modal card styles |
| `src/components/Auth.tsx` | Modify JSX | New layout, keep all logic/state |
| `src/components/Lobby.tsx` | Modify JSX | New layout, keep all logic/state |
| `src/components/GameSetup.tsx` | Modify JSX | New layout, keep all logic/state |
| `src/components/GameTable.tsx` | Modify JSX | Glassmorphism grid, per-player colors |
| `src/components/EndGame.tsx` | Modify JSX | Per-player color inputs |
| `src/components/SettlementResults.tsx` | Modify JSX | Winner hero, debt cards, loser insult |
| `src/components/modals/WelcomeGiftModal.tsx` | Modify JSX | Match new design language |
| `src/components/modals/CreditConfirmationModal.tsx` | Modify JSX | Match new design language |
| `src/components/modals/StoreModal.tsx` | Modify JSX | Match new design language |
| `src/components/modals/GameOverModal.tsx` | Modify JSX | Match new design language |

---

## Player Color System

Used across GameSetup, GameTable, EndGame, SettlementResults. Define once, reference everywhere.

```ts
// Player colors by slot index (0-based)
export const PLAYER_COLORS = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', border: 'rgba(231,76,60,0.35)', glow: 'rgba(231,76,60,0.45)', text: '#e74c3c', dim: 'rgba(231,76,60,0.6)' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)', border: 'rgba(52,152,219,0.35)',  glow: 'rgba(52,152,219,0.45)',  text: '#3498db', dim: 'rgba(52,152,219,0.6)'  },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', border: 'rgba(46,204,113,0.35)',  glow: 'rgba(46,204,113,0.45)',  text: '#2ecc71', dim: 'rgba(46,204,113,0.6)'  },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)', border: 'rgba(155,89,182,0.35)',  glow: 'rgba(155,89,182,0.45)',  text: '#9b59b6', dim: 'rgba(155,89,182,0.6)'  },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)', border: 'rgba(255,107,53,0.35)',  glow: 'rgba(255,107,53,0.45)',  text: '#ff6b35', dim: 'rgba(255,107,53,0.6)'  },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)', border: 'rgba(243,156,18,0.35)',  glow: 'rgba(243,156,18,0.45)',  text: '#f39c12', dim: 'rgba(243,156,18,0.6)'  },
];
```

Host player always gets the color of their slot index (first player = index 0).

---

## Task 1: Design Tokens

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace CSS custom properties block**

Replace the existing `:root { ... }` block in `src/index.css` with:

```css
:root {
  /* Backgrounds */
  --bg-primary:   #080810;
  --bg-secondary: #0d0d18;
  --bg-card:      rgba(255,255,255,0.03);
  --bg-glass:     rgba(255,255,255,0.04);

  /* Text */
  --text-primary:   #ffffff;
  --text-secondary: rgba(255,255,255,0.4);
  --text-dim:       rgba(255,255,255,0.15);

  /* Accent */
  --yellow:        #f5c518;
  --yellow-dark:   #d4a017;
  --yellow-glow:   rgba(245,197,24,0.4);
  --yellow-glass:  rgba(245,197,24,0.1);
  --yellow-border: rgba(245,197,24,0.3);

  /* Semantic */
  --green:   #2ecc71;
  --red:     #e74c3c;
  --border:  rgba(255,255,255,0.07);

  /* Shadows */
  --shadow-card: 0 8px 32px rgba(0,0,0,0.55);
  --shadow-yellow: 0 6px 28px rgba(245,197,24,0.4);

  /* Layout */
  --touch:      48px;
  --radius-sm:  10px;
  --radius-md:  14px;
  --radius-lg:  18px;
  --radius-xl:  24px;

  /* Safe areas */
  --safe-top:    env(safe-area-inset-top,    0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left:   env(safe-area-inset-left,   0px);
  --safe-right:  env(safe-area-inset-right,  0px);

  font-size: 16px;
  line-height: 1.5;
  color-scheme: dark;
  color: var(--text-primary);
  background: var(--bg-primary);
  font-family: -apple-system, 'Heebo', 'Assistant', 'Segoe UI', sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Start dev server and verify app loads**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm run dev
```

Open http://localhost:5173 — app should load with no visual errors (might look broken temporarily, that's fine).

- [ ] **Step 3: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/index.css
git commit -m "feat: update design tokens for hood redesign"
```

---

## Task 2: Loser Insult Utility

**Files:**
- Create: `src/utils/loserInsults.ts`

- [ ] **Step 1: Create the utility**

Create `src/utils/loserInsults.ts`:

```ts
const INSULTS_KEY = 'pocketAce_loserInsults';

const ALL_INSULTS = [
  '{name}, אחי... הקלפים דיברו. 🃏😬',
  '{name} שילם את הכיבוד לכולם. תודה אחי 🙏',
  '{name} — המפסיד הרשמי. יש פעם הבאה אחי 😅',
  '{name}, הפוקר לא עבורך הערב 😂 תחזור חזק',
  '{name}, הערב הקלפים החליטו בלעדיך 🃏',
  '{name} — ליגת האלופים ממתינה. הערב לא. 💀',
  'מישהו צריך לשלם את הפיצה? {name} פה 🍕😂',
  'הניסיון לא עולה כלום. הכסף של {name} כן 😅',
];

function loadQueue(): string[] {
  try {
    const stored = localStorage.getItem(INSULTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: string[]): void {
  localStorage.setItem(INSULTS_KEY, JSON.stringify(queue));
}

function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getLoserInsult(name: string): string {
  let queue = loadQueue();
  if (queue.length === 0) {
    queue = shuffle(ALL_INSULTS);
  }
  const template = queue.shift()!;
  saveQueue(queue);
  return template.replace('{name}', name);
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/utils/loserInsults.ts
git commit -m "feat: add shuffled loser insult pool"
```

---

## Task 3: Auth Screen

**Files:**
- Modify: `src/styles/auth.css` (full rewrite)
- Modify: `src/components/Auth.tsx` (JSX only, keep all logic)

- [ ] **Step 1: Rewrite `src/styles/auth.css`**

```css
/* ─── AUTH SCREEN ─────────────────────────────────────────── */
.auth-screen {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: var(--safe-top) 24px var(--safe-bottom);
  position: relative;
  overflow: hidden;
  direction: rtl;
}

.auth-bg-glow {
  position: absolute;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(245,197,24,0.1) 0%, transparent 70%);
  top: 30%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.auth-inner {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  z-index: 1;
}

.auth-logo-card {
  width: 84px; height: 84px;
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(245,197,24,0.18), rgba(245,197,24,0.04));
  border: 1.5px solid rgba(245,197,24,0.45);
  display: flex; align-items: center; justify-content: center;
  font-size: 40px;
  margin-bottom: 14px;
  box-shadow: 0 8px 36px rgba(245,197,24,0.22);
}

.auth-app-name {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}

.auth-tagline {
  font-size: 13px;
  color: rgba(245,197,24,0.8);
  font-weight: 700;
  margin: 0 0 32px;
  text-align: center;
}

.auth-tab-switcher {
  display: flex;
  background: rgba(255,255,255,0.04);
  border-radius: var(--radius-md);
  padding: 3px;
  width: 100%;
  margin-bottom: 18px;
  border: 1px solid rgba(255,255,255,0.06);
}

.auth-tab {
  flex: 1;
  text-align: center;
  padding: 9px 0;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  transition: all 0.2s;
}

.auth-tab.active {
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111;
  font-weight: 800;
  box-shadow: 0 2px 10px var(--yellow-glow);
}

.auth-inputs {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.auth-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: var(--radius-md);
  padding: 13px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.auth-input-row:focus-within {
  border-color: rgba(245,197,24,0.4);
  box-shadow: 0 0 0 3px rgba(245,197,24,0.07);
}

.auth-input-row input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-primary);
  font-family: inherit;
  direction: rtl;
}

.auth-input-row input::placeholder {
  color: rgba(255,255,255,0.25);
}

.auth-input-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.auth-cta {
  width: 100%;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111;
  border: none;
  padding: 15px 0;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: var(--shadow-yellow);
  margin-bottom: 12px;
  font-family: inherit;
  transition: opacity 0.2s;
}

.auth-cta:disabled { opacity: 0.6; }

.auth-error {
  color: var(--red);
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
}

.auth-link {
  font-size: 11px;
  color: var(--text-dim);
  text-align: center;
}

.auth-link span {
  color: rgba(245,197,24,0.6);
  font-weight: 600;
  cursor: pointer;
}

.auth-divider {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
  width: 100%;
  text-align: center;
  font-size: 11px;
  color: var(--text-dim);
}

/* Verification step */
.auth-verify-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 6px;
  text-align: center;
}

.auth-verify-sub {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 24px;
}
```

- [ ] **Step 2: Update `src/components/Auth.tsx` JSX**

Keep all imports, state, and handlers exactly as they are. Only replace the `return (...)` block:

```tsx
return (
  <div className="auth-screen">
    <div className="auth-bg-glow" />
    <div className="auth-inner">
      <AnimatePresence mode="wait">
        {step === 'initial' ? (
          <motion.div
            key="initial"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="auth-logo-card">♠</div>
            <h1 className="auth-app-name">Pocket Ace</h1>
            <p className="auth-tagline">תן לקלפים לדבר בשבילך ♠</p>

            <div className="auth-tab-switcher">
              <button
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >כניסה</button>
              <button
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >הרשמה</button>
            </div>

            <form className="auth-inputs" onSubmit={handleInitialSubmit} style={{ width: '100%' }}>
              {!isLogin && (
                <div className="auth-input-row">
                  <span className="auth-input-icon"><UserIcon size={15} /></span>
                  <input
                    type="text"
                    placeholder="שם מלא"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="auth-input-row">
                <span className="auth-input-icon"><Phone size={15} /></span>
                <input
                  type="tel"
                  placeholder="מספר פלאפון"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                  dir="ltr"
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-cta" type="submit" disabled={loading}>
                {loading ? '...' : 'בוא נשחק 🤙'}
              </button>
            </form>

            <div className="auth-divider">
              {isLogin
                ? <>פעם ראשונה? <span onClick={() => setIsLogin(false)}>פתח חשבון — זה שניה</span></>
                : <>כבר יש לך חשבון? <span onClick={() => setIsLogin(true)}>כנסו</span></>
              }
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="auth-logo-card">🔑</div>
            <h2 className="auth-verify-title">קוד אימות נשלח</h2>
            <p className="auth-verify-sub">הזן את הקוד שקיבלת למספר {phone}</p>

            <form className="auth-inputs" onSubmit={handleVerificationSubmit} style={{ width: '100%' }}>
              <div className="auth-input-row">
                <span className="auth-input-icon">💬</span>
                <input
                  type="text"
                  placeholder="קוד אימות"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>

              {codeError && <p className="auth-error">{codeError}</p>}

              <button className="auth-cta" type="submit" disabled={verificationLoading}>
                {verificationLoading ? '...' : 'אמת ✓'}
              </button>
            </form>

            <div className="auth-link">
              <span onClick={() => setStep('initial')}>← חזור</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
```

- [ ] **Step 3: Verify in browser**

Check http://localhost:5173 — Auth screen should show new design with logo card, tagline, tab switcher, inputs.

- [ ] **Step 4: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/styles/auth.css src/components/Auth.tsx
git commit -m "feat: redesign Auth screen — hood style"
```

---

## Task 4: Lobby Screen

**Files:**
- Modify: `src/styles/lobby.css` (full rewrite)
- Modify: `src/components/Lobby.tsx` (JSX only, keep all logic)

- [ ] **Step 1: Rewrite `src/styles/lobby.css`**

```css
/* ─── LOBBY ───────────────────────────────────────────────── */
.lobby-screen {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

/* Top bar */
.lobby-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.lobby-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lobby-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 900; color: #111;
  flex-shrink: 0;
}

.lobby-greeting-label { font-size: 11px; color: var(--text-secondary); }
.lobby-greeting-name  { font-size: 14px; font-weight: 800; color: var(--text-primary); }

.lobby-credits-pill {
  display: flex; align-items: center; gap: 5px;
  background: var(--yellow-glass);
  border: 1px solid var(--yellow-border);
  border-radius: 20px;
  padding: 6px 12px;
}

.lobby-credits-pill span { font-size: 13px; font-weight: 800; color: var(--yellow); }
.lobby-credits-pill small { font-size: 10px; color: rgba(245,197,24,0.6); }

/* Scrollable body */
.lobby-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

/* Section label */
.lobby-section-label {
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

/* Stats row */
.lobby-stats {
  display: flex;
  gap: 8px;
  padding: 12px 14px 8px;
}

.lobby-stat-card {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  padding: 10px;
  text-align: center;
}

.lobby-stat-card.green {
  background: linear-gradient(135deg,rgba(46,204,113,0.12),rgba(46,204,113,0.04));
  border-color: rgba(46,204,113,0.25);
}

.lobby-stat-card.yellow {
  background: linear-gradient(135deg,rgba(245,197,24,0.12),rgba(245,197,24,0.04));
  border-color: rgba(245,197,24,0.25);
}

.lobby-stat-value { font-size: 16px; font-weight: 900; color: var(--text-primary); }
.lobby-stat-value.green { color: var(--green); }
.lobby-stat-value.yellow { color: var(--yellow); }
.lobby-stat-label { font-size: 9px; color: var(--text-secondary); margin-top: 2px; }

/* Crew section */
.lobby-crew {
  padding: 4px 14px 10px;
}

.lobby-crew-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.lobby-crew-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.lobby-crew-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}

.lobby-crew-name { font-size: 9px; color: var(--text-secondary); }

.lobby-crew-add {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  border: 1.5px dashed rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: rgba(255,255,255,0.15);
  cursor: pointer;
}

/* CTA */
.lobby-cta-wrap {
  padding: 4px 14px 10px;
}

.lobby-cta {
  width: 100%;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111; border: none;
  padding: 16px 0; border-radius: 16px;
  font-size: 16px; font-weight: 900;
  cursor: pointer;
  box-shadow: var(--shadow-yellow);
  font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

.lobby-cta-sub {
  text-align: center;
  margin-top: 6px;
  font-size: 10px;
  color: var(--text-dim);
}

/* Recent games */
.lobby-history {
  padding: 4px 14px 10px;
}

.lobby-history-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
  cursor: pointer;
  width: 100%;
  text-align: right;
}

.lobby-history-item:last-child { margin-bottom: 0; }

.lobby-history-title { font-size: 11px; font-weight: 700; color: var(--text-primary); }
.lobby-history-sub   { font-size: 9px; color: var(--text-secondary); margin-top: 2px; }
.lobby-history-amount { font-size: 12px; font-weight: 800; }
.lobby-history-amount.win  { color: var(--green); }
.lobby-history-amount.loss { color: var(--red); }

/* Store teaser */
.lobby-store-teaser {
  margin: 0 14px 10px;
  background: linear-gradient(135deg,rgba(245,197,24,0.08),rgba(245,197,24,0.02));
  border: 1px solid rgba(245,197,24,0.18);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  display: flex; align-items: center; justify-content: space-between;
}

.lobby-store-title { font-size: 11px; font-weight: 700; color: rgba(245,197,24,0.9); }
.lobby-store-sub   { font-size: 9px; color: var(--text-secondary); margin-top: 1px; }

.lobby-store-btn {
  background: var(--yellow-glass);
  border: 1px solid var(--yellow-border);
  color: var(--yellow);
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 11px; font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

/* Logout */
.lobby-logout {
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border);
  display: flex; justify-content: center;
}

.lobby-logout-btn {
  font-size: 11px; color: var(--text-dim);
  display: flex; align-items: center; gap: 4px;
  cursor: pointer; background: none; border: none;
  font-family: inherit;
}

/* Bottom sheet overlay */
.lobby-sheet-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 100;
  display: flex; align-items: flex-end;
}

.lobby-sheet-card {
  width: 100%; max-height: 80vh;
  background: #0f0f1a;
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--border);
  padding: 20px 16px 32px;
  overflow-y: auto;
  position: relative;
  direction: rtl;
}

.lobby-sheet-close {
  position: absolute; top: 12px; left: 16px;
  background: rgba(255,255,255,0.06); border: none;
  width: 32px; height: 32px; border-radius: 50%;
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: inherit;
}

.lobby-sheet-title { font-size: 18px; font-weight: 900; margin: 0 0 16px; }
```

- [ ] **Step 2: Update `src/components/Lobby.tsx` JSX**

Keep all imports, state, and logic. Only replace the `return (...)` block.

The `PLAYER_COLORS` array from the File Map section is not needed here — lobby avatars use a fixed set of emoji/colors for the "החבר׳ה הקבועים" row (these are display-only, not linked to actual players).

Replace `return (...)` with:

```tsx
const firstName = user.name.split(' ')[0];
const firstLetter = firstName.charAt(0);

// Static crew display colors (decorative only in lobby)
const CREW_COLORS = ['linear-gradient(135deg,#e74c3c,#c0392b)', 'linear-gradient(135deg,#3498db,#2980b9)', 'linear-gradient(135deg,#2ecc71,#27ae60)'];
const CREW_SHADOWS = ['rgba(231,76,60,0.4)', 'rgba(52,152,219,0.4)', 'rgba(46,204,113,0.4)'];
const CREW_EMOJIS = ['🤙', '😎', '🦈'];

return (
  <div className="lobby-screen">
    {/* Top bar */}
    <div className="lobby-topbar">
      <div className="lobby-user">
        <div className="lobby-avatar">{firstLetter}</div>
        <div>
          <div className="lobby-greeting-label">שלום,</div>
          <div className="lobby-greeting-name">{firstName} 🤙</div>
        </div>
      </div>
      <div className="lobby-credits-pill">
        <span>⚡</span>
        <span>{user.credits}</span>
        <small>קרדיטים</small>
      </div>
    </div>

    <div className="lobby-scroll">
      {/* Stats */}
      {recentGames.length > 0 && (() => {
        const cumulative = calculateCumulativeProfitLoss(user.id, user.name);
        return (
          <div className="lobby-stats">
            <div className={`lobby-stat-card ${cumulative > 0 ? 'green' : ''}`}>
              <div className={`lobby-stat-value ${cumulative > 0 ? 'green' : ''}`}>
                {cumulative > 0 ? '+' : ''}{cumulative.toFixed(0)}₪
              </div>
              <div className="lobby-stat-label">סה"כ רווח</div>
            </div>
            <div className="lobby-stat-card">
              <div className="lobby-stat-value">{recentGames.length}</div>
              <div className="lobby-stat-label">משחקים</div>
            </div>
            <div className="lobby-stat-card yellow">
              <div className="lobby-stat-value yellow">{status.badge || '🃏'}</div>
              <div className="lobby-stat-label" style={{ color: 'rgba(245,197,24,0.6)' }}>סטטוס</div>
            </div>
          </div>
        );
      })()}

      {/* Crew */}
      <div className="lobby-crew">
        <div className="lobby-section-label">החבר׳ה הקבועים</div>
        <div className="lobby-crew-row">
          {CREW_EMOJIS.map((emoji, i) => (
            <div className="lobby-crew-member" key={i}>
              <div
                className="lobby-crew-avatar"
                style={{ background: CREW_COLORS[i], boxShadow: `0 4px 12px ${CREW_SHADOWS[i]}` }}
              >{emoji}</div>
              <span className="lobby-crew-name">שחקן {i + 1}</span>
            </div>
          ))}
          <div className="lobby-crew-member">
            <div className="lobby-crew-add">+</div>
            <span className="lobby-crew-name">הוסף</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="lobby-cta-wrap">
        <motion.button className="lobby-cta" onClick={onStartGame} whileTap={{ scale: 0.97 }}>
          <span>⚡</span><span>פותחים שולחן</span><span>🃏</span>
        </motion.button>
        <div className="lobby-cta-sub">עולה קרדיט אחד</div>
      </div>

      {/* Recent games */}
      {recentGames.length > 0 && (
        <div className="lobby-history">
          <div className="lobby-section-label">משחקים אחרונים</div>
          {recentGames.map(game => {
            const myResult = game.playerResults?.find(p => p.name === user.name);
            const amount = myResult?.profitLossAfterFee ?? 0;
            return (
              <motion.button
                key={game.id}
                className="lobby-history-item"
                onClick={() => setSelectedGame(game)}
                whileTap={{ opacity: 0.7 }}
              >
                <div>
                  <div className="lobby-history-title">
                    {new Date(game.date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })} • {game.debts.length + 1} שחקנים
                  </div>
                  <div className="lobby-history-sub">
                    {game.debts.length} חובות
                  </div>
                </div>
                <div className={`lobby-history-amount ${amount >= 0 ? 'win' : 'loss'}`}>
                  {game.topShark ? `🦈 +${game.topShark.amount.toFixed(0)}₪` : `${amount >= 0 ? '+' : ''}${amount.toFixed(0)}₪`}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Store teaser */}
      <div className="lobby-store-teaser">
        <div>
          <div className="lobby-store-title">⚡ נגמרו הקרדיטים?</div>
          <div className="lobby-store-sub">קנה חבילה ושחק עוד</div>
        </div>
        <button
          className="lobby-store-btn"
          onClick={() => showModal({ type: 'store', data: { onPurchase: onCreditsUpdate } })}
        >חנות</button>
      </div>
    </div>

    {/* Logout */}
    <div className="lobby-logout">
      <button className="lobby-logout-btn" onClick={onLogout}>
        <span>↩</span><span>התנתק</span>
      </button>
    </div>

    {/* Game details bottom sheet */}
    <AnimatePresence>
      {selectedGame && (
        <motion.div
          className="lobby-sheet-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setSelectedGame(null)}
        >
          <motion.div
            className="lobby-sheet-card"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="lobby-sheet-close" onClick={() => setSelectedGame(null)}>✕</button>
            <h2 className="lobby-sheet-title">📊 תוצאות המשחק</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {new Date(selectedGame.date).toLocaleDateString('he-IL')} • מארח: {selectedGame.hostsName}
            </p>
            {selectedGame.topShark && (
              <div style={{ margin: '12px 0', padding: '12px', background: 'rgba(46,204,113,0.08)', borderRadius: 12, border: '1px solid rgba(46,204,113,0.2)' }}>
                <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>🦈 המנצח</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{selectedGame.topShark.name}</div>
                <div style={{ fontSize: 14, color: 'var(--green)', fontWeight: 700 }}>+{selectedGame.topShark.amount.toFixed(0)}₪</div>
              </div>
            )}
            {selectedGame.debts.map((debt, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>{debt.from}</span>
                <span style={{ color: 'var(--text-secondary)' }}>חייב ל-{debt.to}</span>
                <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>{debt.amount.toFixed(0)}₪</span>
              </div>
            ))}
            <button
              onClick={() => setSelectedGame(null)}
              style={{ marginTop: 16, width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px', borderRadius: 12, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >סגור</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Welcome popup */}
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            style={{ background: '#0f0f1a', borderRadius: 20, border: '1px solid var(--border)', padding: 24, width: '100%', maxWidth: 340, position: 'relative', direction: 'rtl' }}
            initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 24 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            <button onClick={() => setShowWelcome(false)} style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.06)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            <h2 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 8px' }}>ברוכים הבאים ל-Pocket Ace ♠</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>כל משחק עולה קרדיט אחד. הקרדיט ינוכה רק כשהמשחק מתחיל. 💎</p>
            <button
              onClick={() => setShowWelcome(false)}
              style={{ width: '100%', background: 'linear-gradient(135deg,var(--yellow),var(--yellow-dark))', color: '#111', border: 'none', padding: 14, borderRadius: 14, fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}
            >בואו נתחיל 🎰</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
```

Also add this import at the top of `Lobby.tsx` (after existing imports):
```tsx
import { calculateCumulativeProfitLoss } from '../utils/gameHistory';
import { showModal } from './modals';
```

- [ ] **Step 3: Verify in browser**

Log in and check the Lobby. Stats, crew row, CTA, recent games should all render correctly.

- [ ] **Step 4: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/styles/lobby.css src/components/Lobby.tsx
git commit -m "feat: redesign Lobby screen — crew + stats"
```

---

## Task 5: GameSetup Screen

**Files:**
- Modify: `src/styles/setup.css` (full rewrite)
- Modify: `src/components/GameSetup.tsx` (JSX only)

- [ ] **Step 1: Read current GameSetup.tsx to understand state/handlers**

```bash
cat "/Users/macbookpro/Desktop/PocketAce app/src/components/GameSetup.tsx"
```

Note the prop names, state variables, and handler functions — you'll keep all of these.

- [ ] **Step 2: Rewrite `src/styles/setup.css`**

```css
/* ─── GAME SETUP ──────────────────────────────────────────── */
.setup-screen {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

.setup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.setup-title { font-size: 18px; font-weight: 900; color: var(--text-primary); margin: 0; }

.setup-back {
  font-size: 11px; color: var(--text-dim); cursor: pointer;
  background: none; border: none; font-family: inherit;
}

.setup-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
}

.setup-section-label {
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

/* Buy-in steppers */
.setup-steppers {
  display: flex;
  gap: 8px;
}

.setup-stepper-card {
  flex: 1;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: var(--radius-md);
  padding: 12px;
}

.setup-stepper-label {
  font-size: 9px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.setup-stepper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setup-stepper-btn {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.setup-stepper-btn.minus {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.4);
}

.setup-stepper-btn.plus {
  background: rgba(245,197,24,0.15);
  border: 1px solid rgba(245,197,24,0.3);
  color: var(--yellow);
}

.setup-stepper-value {
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
}

.setup-rate-pill {
  margin-top: 8px;
  background: linear-gradient(135deg,rgba(245,197,24,0.08),rgba(245,197,24,0.02));
  border: 1px solid rgba(245,197,24,0.15);
  border-radius: 10px;
  padding: 8px 12px;
  text-align: center;
  font-size: 11px;
  color: rgba(245,197,24,0.7);
  font-weight: 600;
}

/* Players */
.setup-players { display: flex; flex-direction: column; gap: 6px; }

.setup-player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}

.setup-player-row.host {
  background: linear-gradient(135deg,rgba(245,197,24,0.1),rgba(245,197,24,0.03));
  border-color: rgba(245,197,24,0.25);
}

.setup-player-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}

.setup-player-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.setup-player-host-badge {
  font-size: 9px; background: var(--yellow); color: #111;
  padding: 1px 5px; border-radius: 4px; font-weight: 700; margin-right: 4px;
}

.setup-player-remove {
  font-size: 16px; color: var(--text-dim); cursor: pointer;
  background: none; border: none; padding: 4px; margin-right: auto;
}

.setup-add-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.03);
  border: 1.5px dashed rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}

.setup-add-icon {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: rgba(255,255,255,0.2);
  flex-shrink: 0;
}

.setup-add-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: rgba(255,255,255,0.2);
  font-family: inherit;
  direction: rtl;
}

.setup-add-input::placeholder { color: rgba(255,255,255,0.2); }
.setup-add-input:focus { color: var(--text-primary); }

/* Bottom CTA */
.setup-footer {
  padding: 10px 16px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.setup-cta {
  width: 100%;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111; border: none;
  padding: 15px 0; border-radius: var(--radius-md);
  font-size: 15px; font-weight: 900;
  cursor: pointer;
  box-shadow: var(--shadow-yellow);
  font-family: inherit;
}

.setup-cta:disabled { opacity: 0.5; cursor: not-allowed; }
```

- [ ] **Step 3: Update GameSetup.tsx JSX**

Read `src/components/GameSetup.tsx` fully, keep all state and handlers. Update the JSX to use the new class names and structure. Key mapping:
- Stepper for `nisPerBuyIn`: label "₪ לכל buy-in", value `{localSettings.nisPerBuyIn}₪`
- Stepper for `chipsPerBuyIn`: label "ז׳יטונים לכל buy-in", value `{localSettings.chipsPerBuyIn}`
- Rate pill: `1 ז׳יטון = {(localSettings.nisPerBuyIn / localSettings.chipsPerBuyIn).toFixed(2)}₪`
- Host row: yellow tint + 👑 badge
- Added players: use `PLAYER_COLORS[index % PLAYER_COLORS.length]` for avatar background
- Add player input: inline text input in `.setup-add-row`
- CTA text: "יאללה, מתחילים! 🚀"

Add at top of file (after existing imports):
```tsx
const PLAYER_COLORS = [
  'linear-gradient(135deg,#e74c3c,#c0392b)',
  'linear-gradient(135deg,#3498db,#2980b9)',
  'linear-gradient(135deg,#2ecc71,#27ae60)',
  'linear-gradient(135deg,#9b59b6,#8e44ad)',
  'linear-gradient(135deg,#ff6b35,#e55a24)',
  'linear-gradient(135deg,#f39c12,#d68910)',
];
```

- [ ] **Step 4: Verify in browser**

Start a game from lobby → GameSetup should render correctly. Stepper +/− should work. Adding/removing players should work.

- [ ] **Step 5: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/styles/setup.css src/components/GameSetup.tsx
git commit -m "feat: redesign GameSetup screen — ז׳יטון terminology"
```

---

## Task 6: GameTable Screen

**Files:**
- Modify: `src/styles/table.css` (full rewrite)
- Modify: `src/components/GameTable.tsx` (JSX rewrite, keep all logic)

- [ ] **Step 1: Rewrite `src/styles/table.css`**

```css
/* ─── GAME TABLE ──────────────────────────────────────────── */
.game-table-screen {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.table-header-left { display: flex; flex-direction: column; }
.table-header-label { font-size: 10px; color: var(--text-secondary); letter-spacing: 2px; text-transform: uppercase; }
.table-header-pot   { font-size: 20px; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
.table-header-pot small { font-size: 12px; color: var(--text-secondary); font-weight: 500; }

.table-player-count {
  display: flex; align-items: center; gap: 5px;
  background: var(--yellow-glass);
  border: 1px solid var(--yellow-border);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px; font-weight: 700; color: var(--yellow);
}

/* Player grid */
.table-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px;
  align-content: start;
  -webkit-overflow-scrolling: touch;
}

.player-card {
  border-radius: var(--radius-lg);
  padding: 12px 10px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  position: relative;
  backdrop-filter: blur(4px);
}

.player-card-badge {
  position: absolute; top: 8px; right: 10px;
  font-size: 9px; font-weight: 700;
  padding: 2px 6px; border-radius: 6px;
}

.player-card-host-badge {
  position: absolute; top: 8px; left: 10px;
  font-size: 9px; font-weight: 700; color: #111;
  background: var(--yellow);
  padding: 2px 5px; border-radius: 4px;
}

.player-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  margin-top: 4px;
}

.player-name {
  font-size: 13px; font-weight: 700; color: var(--text-primary);
}

.player-dots {
  display: flex; gap: 4px; align-items: center;
}

.player-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
}

.player-amount {
  font-size: 11px; font-weight: 600;
}

.player-buyin-btn {
  width: 100%;
  color: #fff; border: none;
  padding: 7px 0; border-radius: 12px;
  font-size: 11px; font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.5px;
}

/* Add player slot */
.table-add-slot {
  border: 2px dashed rgba(255,255,255,0.08);
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  min-height: 160px;
  cursor: pointer;
}

.table-add-slot-icon { font-size: 20px; color: rgba(255,255,255,0.12); }
.table-add-slot-label { font-size: 10px; color: rgba(255,255,255,0.15); font-weight: 600; }

/* Bottom bar */
.table-bottom {
  display: flex; gap: 8px;
  padding: 10px 14px 14px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.table-quit-btn {
  flex: 1;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 12px 0; border-radius: var(--radius-md);
  font-size: 11px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}

.table-end-btn {
  flex: 2.5;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111; border: none;
  padding: 12px 0; border-radius: var(--radius-md);
  font-size: 12px; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--yellow-glow);
  font-family: inherit;
  letter-spacing: 0.5px;
}
```

- [ ] **Step 2: Update `src/components/GameTable.tsx` JSX**

Keep all imports, state, and handlers. Add `PLAYER_COLORS` constant at the top of the file:

```tsx
const PLAYER_COLORS = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', cardBg: 'linear-gradient(145deg,rgba(231,76,60,0.15),rgba(231,76,60,0.05))', border: 'rgba(231,76,60,0.35)', glow: 'rgba(231,76,60,0.45)', text: '#e74c3c', dotActive: '#e74c3c', dotGlow: 'rgba(231,76,60,0.8)', badgeBg: 'rgba(231,76,60,0.15)', badgeText: 'rgba(231,76,60,0.8)', btnShadow: 'rgba(231,76,60,0.35)' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)', cardBg: 'linear-gradient(145deg,rgba(52,152,219,0.15),rgba(52,152,219,0.05))',  border: 'rgba(52,152,219,0.35)',  glow: 'rgba(52,152,219,0.45)',  text: '#3498db', dotActive: '#3498db', dotGlow: 'rgba(52,152,219,0.8)',  badgeBg: 'rgba(52,152,219,0.15)',  badgeText: 'rgba(52,152,219,0.8)',  btnShadow: 'rgba(52,152,219,0.35)'  },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', cardBg: 'linear-gradient(145deg,rgba(46,204,113,0.15),rgba(46,204,113,0.05))',  border: 'rgba(46,204,113,0.35)',  glow: 'rgba(46,204,113,0.45)',  text: '#2ecc71', dotActive: '#2ecc71', dotGlow: 'rgba(46,204,113,0.8)',  badgeBg: 'rgba(46,204,113,0.15)',  badgeText: 'rgba(46,204,113,0.8)',  btnShadow: 'rgba(46,204,113,0.35)'  },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)', cardBg: 'linear-gradient(145deg,rgba(155,89,182,0.15),rgba(155,89,182,0.05))',  border: 'rgba(155,89,182,0.35)',  glow: 'rgba(155,89,182,0.45)',  text: '#9b59b6', dotActive: '#9b59b6', dotGlow: 'rgba(155,89,182,0.8)',  badgeBg: 'rgba(155,89,182,0.15)',  badgeText: 'rgba(155,89,182,0.8)',  btnShadow: 'rgba(155,89,182,0.35)'  },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)', cardBg: 'linear-gradient(145deg,rgba(255,107,53,0.15),rgba(255,107,53,0.05))',  border: 'rgba(255,107,53,0.35)',  glow: 'rgba(255,107,53,0.45)',  text: '#ff6b35', dotActive: '#ff6b35', dotGlow: 'rgba(255,107,53,0.8)',  badgeBg: 'rgba(255,107,53,0.15)',  badgeText: 'rgba(255,107,53,0.8)',  btnShadow: 'rgba(255,107,53,0.35)'  },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)', cardBg: 'linear-gradient(145deg,rgba(243,156,18,0.15),rgba(243,156,18,0.05))',  border: 'rgba(243,156,18,0.35)',  glow: 'rgba(243,156,18,0.45)',  text: '#f39c12', dotActive: '#f39c12', dotGlow: 'rgba(243,156,18,0.8)',  badgeBg: 'rgba(243,156,18,0.15)',  badgeText: 'rgba(243,156,18,0.8)',  btnShadow: 'rgba(243,156,18,0.35)'  },
];

const MAX_DOTS = 4;
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];
```

Replace `return (...)` with:

```tsx
const totalZhetons = players.reduce((sum, p) => sum + (p.buyIns * settings.chipsPerBuyIn), 0);

return (
  <div className="game-table-screen">
    <div className="table-header">
      <div className="table-header-left">
        <div className="table-header-label">שולחן פעיל</div>
        <div className="table-header-pot">
          {players.reduce((sum, p) => sum + p.totalInvested, 0)}{' '}
          <small>₪ בקופה</small>
        </div>
      </div>
      <div className="table-player-count">
        <span>⚡</span>
        <span>{players.length} שחקנים</span>
      </div>
    </div>

    <div className="table-grid">
      {players.map((player, index) => {
        const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
        const isOnFire = player.buyIns >= 3;
        const emoji = PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];
        const dots = Array.from({ length: Math.min(MAX_DOTS, Math.max(player.buyIns, 1)) });

        return (
          <motion.div
            key={player.id}
            className="player-card"
            style={{ background: color.cardBg, border: `1px solid ${color.border}` }}
            variants={playerCardVariants}
            whileTap="tap"
          >
            <div
              className="player-card-badge"
              style={{ background: isOnFire ? 'rgba(255,107,53,0.2)' : color.badgeBg, color: isOnFire ? '#ff6b35' : color.badgeText }}
            >
              ×{player.buyIns}{isOnFire ? ' 🔥' : ''}
            </div>
            {player.isHost && <div className="player-card-host-badge">👑</div>}

            <div
              className="player-avatar"
              style={{ background: color.bg, boxShadow: `0 4px 16px ${color.glow}` }}
            >{emoji}</div>

            <div className="player-name">{player.name}</div>

            <div className="player-dots">
              {dots.map((_, i) => (
                <div
                  key={i}
                  className="player-dot"
                  style={i < player.buyIns
                    ? { background: color.dotActive, boxShadow: `0 0 6px ${color.dotGlow}`, border: 'none' }
                    : {}}
                />
              ))}
            </div>

            <div className="player-amount" style={{ color: color.text }}>
              {player.totalInvested}₪
            </div>

            <motion.button
              className="player-buyin-btn"
              style={{ background: color.bg, boxShadow: `0 4px 12px ${color.btnShadow}` }}
              onClick={() => handleAddBuyIn(player.id)}
              whileTap={{ scale: 0.96 }}
            >+ Buy In</motion.button>
          </motion.div>
        );
      })}

      <div className="table-add-slot">
        <div className="table-add-slot-icon">+</div>
        <div className="table-add-slot-label">הוסף שחקן</div>
      </div>
    </div>

    <div className="table-bottom">
      <button className="table-quit-btn" onClick={onQuit}>🚪 יציאה</button>
      <motion.button className="table-end-btn" onClick={onEndGame} whileTap={{ scale: 0.97 }}>
        🏁 סיים משחק
      </motion.button>
    </div>

    {toastMessage && <Toast message={toastMessage} onDone={() => setToastMessage(null)} />}
  </div>
);
```

- [ ] **Step 3: Verify in browser**

Start a game, add players, verify each gets a unique color card. Buy-in button should work. Fire indicator at ×3.

- [ ] **Step 4: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/styles/table.css src/components/GameTable.tsx
git commit -m "feat: redesign GameTable — glassmorphism per-player color grid"
```

---

## Task 7: EndGame Screen

**Files:**
- Modify: `src/styles/endgame.css` (full rewrite)
- Modify: `src/components/EndGame.tsx` (JSX only)

- [ ] **Step 1: Read current EndGame.tsx**

```bash
cat "/Users/macbookpro/Desktop/PocketAce app/src/components/EndGame.tsx"
```

Note all state (chip values per player), handlers, and validation logic.

- [ ] **Step 2: Rewrite `src/styles/endgame.css`**

```css
/* ─── END GAME ────────────────────────────────────────────── */
.endgame-screen {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

.endgame-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.endgame-title { font-size: 18px; font-weight: 900; color: var(--text-primary); margin: 0; }
.endgame-back  { font-size: 11px; color: var(--text-dim); cursor: pointer; background: none; border: none; font-family: inherit; }

.endgame-total-pill {
  margin: 12px 16px 4px;
  background: linear-gradient(135deg,rgba(245,197,24,0.08),rgba(245,197,24,0.02));
  border: 1px solid rgba(245,197,24,0.18);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  display: flex; justify-content: space-between; align-items: center;
}

.endgame-total-label { font-size: 11px; color: var(--text-secondary); }
.endgame-total-value { font-size: 14px; font-weight: 900; color: var(--yellow); }

.endgame-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  -webkit-overflow-scrolling: touch;
}

/* Per-player input row */
.endgame-player-row {
  border-radius: var(--radius-md);
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
}

.endgame-player-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.endgame-player-info { flex: 1; }
.endgame-player-name     { font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
.endgame-player-invested { font-size: 9px; color: var(--text-secondary); }

.endgame-stepper {
  display: flex; align-items: center; gap: 6px;
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 4px 8px;
}

.endgame-stepper-btn {
  font-size: 16px; padding: 0 4px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; line-height: 1;
}

.endgame-stepper-value {
  font-size: 15px; font-weight: 900; color: var(--text-primary);
  min-width: 38px; text-align: center;
}

/* Validation row */
.endgame-validation {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px;
  border-radius: 10px;
  margin-top: 4px;
}

.endgame-validation.valid {
  background: rgba(46,204,113,0.08);
  border: 1px solid rgba(46,204,113,0.2);
}

.endgame-validation.invalid {
  background: rgba(231,76,60,0.08);
  border: 1px solid rgba(231,76,60,0.2);
}

.endgame-validation-label { font-size: 10px; color: var(--text-secondary); }
.endgame-validation-value { font-size: 13px; font-weight: 800; }
.endgame-validation-value.valid   { color: var(--green); }
.endgame-validation-value.invalid { color: var(--red); }

/* Footer */
.endgame-footer {
  padding: 10px 16px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.endgame-cta {
  width: 100%;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111; border: none;
  padding: 15px 0; border-radius: var(--radius-md);
  font-size: 15px; font-weight: 900;
  cursor: pointer; box-shadow: var(--shadow-yellow);
  font-family: inherit;
}

.endgame-cta:disabled { opacity: 0.5; cursor: not-allowed; }
```

- [ ] **Step 3: Update EndGame.tsx JSX**

Keep all state and logic. Add `PLAYER_COLORS` and `PLAYER_EMOJIS` constants (same as GameTable). Replace `return (...)` using the new CSS classes. Key structure:

```tsx
// At top of component (same PLAYER_COLORS and PLAYER_EMOJIS as GameTable):
const PLAYER_COLORS = [ /* same array as Task 6 */ ];
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];

// In return():
const totalZhetons = players.reduce((sum, p) => sum + (p.buyIns * settings.chipsPerBuyIn), 0);
const currentTotal = Object.values(finalChips).reduce((sum, v) => sum + (v || 0), 0);
const isValid = currentTotal === totalZhetons;

return (
  <div className="endgame-screen">
    <div className="endgame-header">
      <h1 className="endgame-title">כמה ז׳יטונים יש לך? 🏁</h1>
      <button className="endgame-back" onClick={onBack}>← חזור</button>
    </div>

    <div className="endgame-total-pill">
      <span className="endgame-total-label">סה״כ ז׳יטונים בשולחן</span>
      <span className="endgame-total-value">{totalZhetons} ז׳יטונים</span>
    </div>

    <div className="endgame-body">
      {players.map((player, index) => {
        const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
        const emoji = PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];
        const value = finalChips[player.id] ?? 0;

        return (
          <div
            key={player.id}
            className="endgame-player-row"
            style={{ background: color.cardBg, border: `1px solid ${color.border}` }}
          >
            <div
              className="endgame-player-avatar"
              style={{ background: color.bg, boxShadow: `0 4px 12px ${color.glow}` }}
            >{emoji}</div>
            <div className="endgame-player-info">
              <div className="endgame-player-name">{player.name}</div>
              <div className="endgame-player-invested">השקיע: {player.totalInvested}₪ (×{player.buyIns})</div>
            </div>
            <div
              className="endgame-stepper"
              style={{ border: `1px solid ${color.border}` }}
            >
              <button
                className="endgame-stepper-btn"
                style={{ color: `${color.text}60` }}
                onClick={() => handleChipChange(player.id, Math.max(0, value - settings.chipsPerBuyIn))}
              >−</button>
              <div className="endgame-stepper-value">{value}</div>
              <button
                className="endgame-stepper-btn"
                style={{ color: color.text }}
                onClick={() => handleChipChange(player.id, value + settings.chipsPerBuyIn)}
              >+</button>
            </div>
          </div>
        );
      })}

      <div className={`endgame-validation ${isValid ? 'valid' : 'invalid'}`}>
        <span className="endgame-validation-label">סה״כ הוזן</span>
        <span className={`endgame-validation-value ${isValid ? 'valid' : 'invalid'}`}>
          {currentTotal} {isValid ? '✅ מדויק!' : `/ ${totalZhetons}`}
        </span>
      </div>
    </div>

    <div className="endgame-footer">
      <button
        className="endgame-cta"
        onClick={handleCalculate}
        disabled={!isValid}
      >חשב מי חייב למי 🧮</button>
    </div>
  </div>
);
```

Note: use existing state variable names from the component (e.g., `finalChips`, `handleChipChange`, `handleCalculate`).

- [ ] **Step 4: Verify in browser**

Play through to EndGame. Each player row should show their color. Validation should turn green when total matches.

- [ ] **Step 5: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/styles/endgame.css src/components/EndGame.tsx
git commit -m "feat: redesign EndGame — per-player color steppers + validation"
```

---

## Task 8: SettlementResults Screen

**Files:**
- Modify: `src/styles/results.css` (full rewrite)
- Modify: `src/components/SettlementResults.tsx` (JSX + import loserInsults)

- [ ] **Step 1: Read current SettlementResults.tsx**

```bash
cat "/Users/macbookpro/Desktop/PocketAce app/src/components/SettlementResults.tsx"
```

Note all props, state, and handlers (especially WhatsApp share if it exists).

- [ ] **Step 2: Rewrite `src/styles/results.css`**

```css
/* ─── SETTLEMENT RESULTS ──────────────────────────────────── */
.results-screen {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

.results-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border);
  text-align: center;
  flex-shrink: 0;
}

.results-title    { font-size: 22px; font-weight: 900; color: var(--text-primary); margin: 0 0 2px; }
.results-subtitle { font-size: 10px; color: var(--text-secondary); }

.results-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  -webkit-overflow-scrolling: touch;
}

/* Section label */
.results-section-label {
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

/* Winner hero */
.results-winner {
  margin: 12px 16px 8px;
  background: linear-gradient(135deg,rgba(46,204,113,0.15),rgba(46,204,113,0.04));
  border: 1px solid rgba(46,204,113,0.35);
  border-radius: var(--radius-lg);
  padding: 14px;
  display: flex; align-items: center; gap: 12px;
  position: relative; overflow: hidden;
}

.results-winner-bg {
  position: absolute; top: -10px; left: -10px;
  font-size: 60px; opacity: 0.06; pointer-events: none;
}

.results-winner-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg,#2ecc71,#27ae60);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
  box-shadow: 0 6px 20px rgba(46,204,113,0.5);
  flex-shrink: 0;
}

.results-winner-label  { font-size: 10px; color: rgba(46,204,113,0.7); font-weight: 600; letter-spacing: 1px; margin-bottom: 2px; }
.results-winner-name   { font-size: 18px; font-weight: 900; color: var(--text-primary); }
.results-winner-amount { font-size: 13px; font-weight: 700; color: var(--green); }
.results-winner-season { text-align: left; }
.results-winner-season-label  { font-size: 9px; color: var(--text-secondary); margin-bottom: 2px; }
.results-winner-season-amount { font-size: 15px; font-weight: 900; color: var(--green); }

/* Players list */
.results-players { padding: 0 16px 10px; }

.results-player-row {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 6px;
}

.results-player-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}

.results-player-name   { flex: 1; font-size: 12px; font-weight: 700; color: var(--text-primary); }
.results-player-amount { font-size: 13px; font-weight: 800; }
.results-player-amount.win  { color: var(--green); }
.results-player-amount.loss { color: var(--red); }

/* Loser insult */
.results-loser-insult {
  margin: 0 16px 10px;
  padding: 8px 12px;
  background: rgba(231,76,60,0.06);
  border: 1px solid rgba(231,76,60,0.15);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  text-align: center;
  font-style: italic;
}

/* Debts */
.results-debts { padding: 0 16px 10px; }

.results-debt-card {
  background: linear-gradient(135deg,rgba(245,197,24,0.08),rgba(245,197,24,0.02));
  border: 1px solid rgba(245,197,24,0.2);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 6px;
}

.results-debt-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; flex-shrink: 0;
}

.results-debt-name   { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.results-debt-to     { font-size: 10px; color: var(--text-secondary); }
.results-debt-amount { margin-right: auto; font-size: 14px; font-weight: 900; color: var(--yellow); }

/* WhatsApp share */
.results-whatsapp {
  margin: 0 16px 10px;
  background: linear-gradient(135deg,rgba(37,211,102,0.12),rgba(37,211,102,0.04));
  border: 1px solid rgba(37,211,102,0.25);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer;
  width: 100%; text-align: right;
  font-family: inherit;
}

.results-whatsapp-icon  { font-size: 22px; }
.results-whatsapp-title { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.results-whatsapp-sub   { font-size: 9px; color: var(--text-secondary); margin-top: 1px; }
.results-whatsapp-arrow { margin-right: auto; font-size: 16px; color: var(--text-dim); }

/* Bottom */
.results-footer {
  display: flex; gap: 8px;
  padding: 10px 16px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.results-home-btn {
  flex: 1;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 13px 0; border-radius: var(--radius-md);
  font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: inherit;
}

.results-again-btn {
  flex: 2;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111; border: none;
  padding: 13px 0; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--yellow-glow);
  font-family: inherit;
}
```

- [ ] **Step 3: Update SettlementResults.tsx JSX**

Add import at top:
```tsx
import { getLoserInsult } from '../utils/loserInsults';
```

Add these constants inside the component (before return):
```tsx
const PLAYER_COLORS = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', cardBg: 'linear-gradient(145deg,rgba(231,76,60,0.15),rgba(231,76,60,0.05))', border: 'rgba(231,76,60,0.35)', glow: 'rgba(231,76,60,0.45)', text: '#e74c3c' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)', cardBg: 'linear-gradient(145deg,rgba(52,152,219,0.15),rgba(52,152,219,0.05))',  border: 'rgba(52,152,219,0.35)',  glow: 'rgba(52,152,219,0.45)',  text: '#3498db' },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', cardBg: 'linear-gradient(145deg,rgba(46,204,113,0.15),rgba(46,204,113,0.05))',  border: 'rgba(46,204,113,0.35)',  glow: 'rgba(46,204,113,0.45)',  text: '#2ecc71' },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)', cardBg: 'linear-gradient(145deg,rgba(155,89,182,0.15),rgba(155,89,182,0.05))',  border: 'rgba(155,89,182,0.35)',  glow: 'rgba(155,89,182,0.45)',  text: '#9b59b6' },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)', cardBg: 'linear-gradient(145deg,rgba(255,107,53,0.15),rgba(255,107,53,0.05))',  border: 'rgba(255,107,53,0.35)',  glow: 'rgba(255,107,53,0.45)',  text: '#ff6b35' },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)', cardBg: 'linear-gradient(145deg,rgba(243,156,18,0.15),rgba(243,156,18,0.05))',  border: 'rgba(243,156,18,0.35)',  glow: 'rgba(243,156,18,0.45)',  text: '#f39c12' },
];
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];

const biggestLoser = [...settlements].sort((a, b) => a.profitLossAfterFee - b.profitLossAfterFee)[0];
const loserInsult = biggestLoser && biggestLoser.profitLossAfterFee < 0
  ? getLoserInsult(biggestLoser.name)
  : null;

const winner = [...settlements].sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee)[0];

const handleWhatsAppShare = () => {
  const lines = debts.map(d => `${d.from.name} חייב ל${d.to.name}: ${d.amount.toFixed(0)}₪`);
  const text = `תוצאות פוקר 🃏\n${lines.join('\n')}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};
```

Replace `return (...)` with:

```tsx
return (
  <motion.div className="results-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="results-header">
      <div className="results-title">תוצאות המשחק 🏆</div>
      <div className="results-subtitle">
        {settlements.length} שחקנים • {settlements.reduce((s, p) => s + p.totalInvested, 0)}₪ בקופה
      </div>
    </div>

    <div className="results-body">
      {/* Winner hero */}
      {winner && winner.profitLossAfterFee > 0 && (
        <div className="results-winner">
          <div className="results-winner-bg">🦈</div>
          <div className="results-winner-avatar">🦈</div>
          <div style={{ flex: 1 }}>
            <div className="results-winner-label">🏆 המנצח הגדול</div>
            <div className="results-winner-name">{winner.name}</div>
            <div className="results-winner-amount">+{winner.profitLossAfterFee.toFixed(0)}₪ הערב</div>
          </div>
        </div>
      )}

      {/* All players */}
      <div className="results-players">
        <div className="results-section-label">כל השחקנים</div>
        {settlements
          .slice()
          .sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee)
          .map((s, index) => {
            const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
            const emoji = PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];
            const amount = s.profitLossAfterFee;
            return (
              <div className="results-player-row" key={s.id}>
                <div className="results-player-avatar" style={{ background: color.bg }}>
                  {emoji}
                </div>
                <div className="results-player-name">{s.name}</div>
                <div className={`results-player-amount ${amount >= 0 ? 'win' : 'loss'}`}>
                  {amount >= 0 ? '+' : ''}{amount.toFixed(0)}₪
                </div>
              </div>
            );
          })}
      </div>

      {/* Loser insult */}
      {loserInsult && (
        <div className="results-loser-insult">{loserInsult}</div>
      )}

      {/* Debts */}
      {debts.length > 0 && (
        <div className="results-debts">
          <div className="results-section-label">מי חייב למי 💸</div>
          {debts.map((debt, i) => {
            const fromIndex = settlements.findIndex(s => s.id === debt.from.id);
            const toIndex   = settlements.findIndex(s => s.id === debt.to.id);
            const fromColor = PLAYER_COLORS[fromIndex % PLAYER_COLORS.length];
            const toColor   = PLAYER_COLORS[toIndex   % PLAYER_COLORS.length];
            return (
              <div className="results-debt-card" key={i}>
                <div className="results-debt-avatar" style={{ background: fromColor.bg }}>{PLAYER_EMOJIS[fromIndex % PLAYER_EMOJIS.length]}</div>
                <div>
                  <div className="results-debt-name">{debt.from.name}</div>
                  <div className="results-debt-to">חייב ל-{debt.to.name}</div>
                </div>
                <div className="results-debt-avatar" style={{ background: toColor.bg, marginRight: 'auto' }}>{PLAYER_EMOJIS[toIndex % PLAYER_EMOJIS.length]}</div>
                <div className="results-debt-amount">{debt.amount.toFixed(0)}₪</div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp share */}
      <button className="results-whatsapp" onClick={handleWhatsAppShare}>
        <div className="results-whatsapp-icon">💬</div>
        <div>
          <div className="results-whatsapp-title">שתף לווצאפ</div>
          <div className="results-whatsapp-sub">שלח לקבוצה מי חייב למי</div>
        </div>
        <div className="results-whatsapp-arrow">←</div>
      </button>
    </div>

    <div className="results-footer">
      <button className="results-home-btn" onClick={onHome}>🏠 לובי</button>
      <button className="results-again-btn" onClick={onPlayAgain}>משחק נוסף? יאללה 🃏</button>
    </div>
  </motion.motion.div>
);
```

Note: fix the closing tag — `</motion.div>` not `</motion.motion.div>`.

- [ ] **Step 4: Verify in browser**

Play a full game end-to-end. Results screen should show winner hero, player list, debt cards, loser insult, WhatsApp button.

- [ ] **Step 5: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/styles/results.css src/components/SettlementResults.tsx src/utils/loserInsults.ts
git commit -m "feat: redesign Results screen — winner hero, debt cards, loser insult, WhatsApp share"
```

---

## Task 9: Modals

**Files:**
- Modify: `src/styles/modals.css` (full rewrite)
- Modify: `src/components/modals/WelcomeGiftModal.tsx`
- Modify: `src/components/modals/CreditConfirmationModal.tsx`
- Modify: `src/components/modals/StoreModal.tsx`
- Modify: `src/components/modals/GameOverModal.tsx`

- [ ] **Step 1: Read all 4 modal files**

```bash
cat "/Users/macbookpro/Desktop/PocketAce app/src/components/modals/WelcomeGiftModal.tsx"
cat "/Users/macbookpro/Desktop/PocketAce app/src/components/modals/CreditConfirmationModal.tsx"
cat "/Users/macbookpro/Desktop/PocketAce app/src/components/modals/StoreModal.tsx"
cat "/Users/macbookpro/Desktop/PocketAce app/src/components/modals/GameOverModal.tsx"
```

- [ ] **Step 2: Rewrite `src/styles/modals.css`**

```css
/* ─── MODALS ──────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 360px;
  background: #0f0f1a;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 24px;
  position: relative;
  direction: rtl;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}

.modal-close {
  position: absolute;
  top: 12px; left: 12px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-family: inherit;
}

.modal-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.modal-body {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 20px;
  line-height: 1.6;
}

.modal-cta {
  width: 100%;
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111; border: none;
  padding: 14px 0; border-radius: var(--radius-md);
  font-size: 14px; font-weight: 900;
  cursor: pointer;
  box-shadow: var(--shadow-yellow);
  font-family: inherit;
  margin-bottom: 8px;
}

.modal-secondary-btn {
  width: 100%;
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 12px 0; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit;
}

/* Store modal specific */
.modal-store-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}

.modal-store-item.featured {
  background: linear-gradient(135deg,rgba(245,197,24,0.1),rgba(245,197,24,0.03));
  border-color: rgba(245,197,24,0.25);
}

.modal-store-icon  { font-size: 22px; }
.modal-store-name  { font-size: 12px; font-weight: 700; color: var(--text-primary); }
.modal-store-meta  { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }
.modal-store-price { font-size: 13px; font-weight: 800; color: var(--text-primary); margin-right: auto; }
.modal-store-featured-tag {
  font-size: 9px; background: var(--yellow); color: #111;
  padding: 1px 5px; border-radius: 4px; font-weight: 700; margin-right: 4px;
}

.modal-store-buy-btn {
  background: linear-gradient(135deg, var(--yellow), var(--yellow-dark));
  color: #111; border: none;
  padding: 6px 14px; border-radius: 10px;
  font-size: 11px; font-weight: 800;
  cursor: pointer; font-family: inherit;
}

.modal-store-buy-btn:disabled { opacity: 0.5; }
```

- [ ] **Step 3: Update each modal's JSX**

For each of the 4 modals, keep all logic (props, callbacks, state) and update only the JSX to use the new class names:

**Pattern for all modals:**
```tsx
return (
  <motion.div
    className="modal-card"
    initial={{ scale: 0.85, y: 24 }}
    animate={{ scale: 1, y: 0 }}
    exit={{ scale: 0.85, y: 24 }}
    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    onClick={e => e.stopPropagation()}
  >
    <button className="modal-close" onClick={onClose}>✕</button>
    <div className="modal-icon">{/* emoji */}</div>
    <h2 className="modal-title">{/* title */}</h2>
    <p className="modal-body">{/* body text */}</p>
    <button className="modal-cta" onClick={/* primary action */}>{/* CTA text */}</button>
    {/* secondary button if needed */}
  </motion.div>
);
```

**WelcomeGiftModal:** icon 🎁, title "מתנת ברוכים הבאים!", body shows credits received, CTA "אחלה! נתחיל 🤙"

**CreditConfirmationModal:** icon ⚡, title "פותחים שולחן?", body shows credits remaining, CTA "יאללה, מתחילים! 🃏", secondary "ביטול"

**StoreModal:** title "חנות קרדיטים ⚡", render `CREDIT_PACKAGES` using `.modal-store-item` with `.modal-store-buy-btn`

**GameOverModal:** icon 😅, title "נגמרו הקרדיטים!", body "כדי לפתוח שולחן חדש צריך קרדיטים", CTA "לחנות 🛒", secondary "ביטול"

- [ ] **Step 4: Verify modals**

Trigger each modal:
- WelcomeGift: clear localStorage and refresh
- CreditConfirmation: click "פותחים שולחן" in lobby
- Store: click "חנות" in lobby
- GameOver: set credits to 0 in localStorage then try to start game

- [ ] **Step 5: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add src/styles/modals.css src/components/modals/
git commit -m "feat: restyle all modals to match new design language"
```

---

## Task 10: Final Polish + Build Check

**Files:** All (read-only verification)

- [ ] **Step 1: Run TypeScript check**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npx tsc --noEmit
```

Expected: no errors. Fix any type errors before proceeding.

- [ ] **Step 2: Full flow smoke test**

Walk through the complete app flow manually:
1. Auth → enter phone → verification code → lobby
2. Lobby → stats visible → crew row visible → open store modal → close
3. Lobby → "פותחים שולחן" → confirmation modal → confirm
4. GameSetup → adjust nis/zhetons → add 3 players → "יאללה מתחילים"
5. GameTable → verify player colors → add buy-in → fire indicator at ×3
6. GameTable → "סיים משחק"
7. EndGame → enter zhetons → validation turns green → "חשב מי חייב למי"
8. Results → winner hero → player list → loser insult → debt cards → WhatsApp button

- [ ] **Step 3: Production build**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Final commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app"
git add -A
git commit -m "feat: complete PocketAce UX/UI redesign — hood/crew style"
```
