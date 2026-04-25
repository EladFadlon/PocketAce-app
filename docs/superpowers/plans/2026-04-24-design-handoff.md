# Design Handoff — PocketAce Visual Reskin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current yellow/space-purple visual system with the design handoff's warm charcoal + sage green + gold + rust palette, matching the prototype in `design_handoff_pocketace/PocketAce.html` — without touching any logic, state, routing, or data flow.

**Architecture:** All changes are CSS-only except for two JSX touches in Auth.tsx (logo markup + floating suits) and GameTable.tsx (ChipStack component + PLAYER_COLORS palette swap). Every screen has its own CSS file in `src/styles/` that maps 1-to-1 to a component; we restyle each file in turn. Shared tokens and the `.surface` / `.btn-*` / `.input-base` base classes live in `src/index.css`.

**Tech Stack:** React 19, TypeScript, Vite, Framer Motion (kept as-is), IBM Plex Mono (added via fonts.css), Heebo (already loaded), Lucide React icons (unchanged)

---

## File Map

| File | Change type |
|---|---|
| `src/index.css` | Replace all tokens; add grain texture; add `.surface`, `.btn-primary/danger/ghost/gold`, `.input-base` shared classes |
| `src/styles/fonts.css` | Add IBM Plex Mono import |
| `src/styles/auth.css` | Full restyle — new logo, floating suits, `.surface` card, tab toggle |
| `src/components/Auth.tsx` | JSX: split logo into "Pocket / Ace", add floating suit symbols, add big bg ♠ |
| `src/styles/lobby.css` | Full restyle — greeting header, 3-col stats grid in `.surface`, history cards with right border |
| `src/styles/setup.css` | Restyle — circular stepper buttons, quick-select pills, player rows with gold index |
| `src/styles/table.css` | Restyle — dominant clock header, list-row player layout, +קנייה amber ghost button, rust end button |
| `src/components/GameTable.tsx` | Swap `PLAYER_COLORS` palettes to match design; replace grid layout with list rows; add `ChipStack` component; add clock display |
| `src/styles/endgame.css` | Restyle — validation bar with transitioning border, stepper controls, gold gradient CTA |
| `src/styles/results.css` | Restyle — amber glow bg, player cards with right border + badge, debt gradient dividers |

---

## Task 0: Global tokens, shared classes, font

**Files:**
- Modify: `src/index.css`
- Modify: `src/styles/fonts.css`

- [ ] **Step 1: Add IBM Plex Mono to fonts.css**

Open `src/styles/fonts.css` and add at the top (before any existing `@import`):

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Heebo:wght@300;400;500;700;800;900&display=swap');
```

- [ ] **Step 2: Replace all design tokens in index.css**

Replace the entire `:root { … }` block (lines 3–55) in `src/index.css` with:

```css
:root {
  /* ── New warm-charcoal palette ── */
  --bg0:     #1A1614;
  --bg1:     #201C18;
  --bg2:     #272118;
  --bg3:     #2E2820;
  --bg4:     #362E24;

  --paper:   #C8BEA8;
  --muted:   rgba(200,190,168,0.38);
  --dimmer:  rgba(200,190,168,0.14);
  --dimmest: rgba(200,190,168,0.07);

  --sage:    #4A7A5A;
  --sage2:   #5E9A70;
  --sage-bg: rgba(74,122,90,0.12);

  --rust:    #8A4A2A;
  --rust2:   #A85A38;
  --rust-bg: rgba(138,74,42,0.12);

  --gold:    #C49A2C;
  --gold-bg: rgba(196,154,44,0.10);
  --gold-border: rgba(196,154,44,0.20);

  --border:  rgba(200,190,168,0.08);
  --borderA: rgba(200,190,168,0.18);

  /* Legacy aliases — keep so unchanged components don't break */
  --bg-primary:   var(--bg0);
  --bg-secondary: var(--bg1);
  --bg-card:      var(--bg2);
  --bg-glass:     var(--bg3);
  --text-primary:   var(--paper);
  --text-secondary: var(--muted);
  --text-dim:       var(--dimmer);
  --yellow:        var(--gold);
  --yellow-dark:   #7A5C14;
  --yellow-glow:   rgba(196,154,44,0.30);
  --yellow-glass:  var(--gold-bg);
  --yellow-border: var(--gold-border);
  --green:   var(--sage2);
  --red:     var(--rust2);

  /* Shadows */
  --shadow-card:   0 4px 24px rgba(0,0,0,0.30);
  --shadow-yellow: 0 3px 16px rgba(74,122,90,0.18);

  /* Layout tokens (unchanged) */
  --touch:      48px;
  --radius-sm:  10px;
  --radius-md:  10px;
  --radius-lg:  10px;
  --radius-xl:  10px;
  --safe-top:    env(safe-area-inset-top,    0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left:   env(safe-area-inset-left,   0px);
  --safe-right:  env(safe-area-inset-right,  0px);

  font-size: 16px;
  line-height: 1.5;
  color-scheme: dark;
  color: var(--paper);
  background: var(--bg0);
  font-family: 'Heebo', 'Assistant', -apple-system, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 3: Add grain texture and shared component classes to index.css**

After the `:root` block, **replace** the `/* ─── GLOBAL RESET ─── */` section and everything below it with:

```css
/* ─── GLOBAL RESET ───────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  height: 100%;
  font-size: 16px;
  overflow: hidden;
  direction: rtl;
  text-align: right;
}

body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: var(--bg0);
}

/* Diagonal film-grain texture */
body::after {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none; z-index: 9999;
  opacity: 0.04;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(200,190,168,0.35) 0px,
    rgba(200,190,168,0.35) 1px,
    transparent 1px,
    transparent 6px
  );
}

/* ─── SHARED SURFACE CARD ────────────────────────────────────── */
.surface {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}
.surface::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,190,168,0.12), transparent);
  pointer-events: none;
}

/* ─── SHARED BUTTONS ─────────────────────────────────────────── */
.btn-new {
  font-family: 'Heebo', sans-serif;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.16s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.01em;
  border-radius: 8px;
}
.btn-new:active  { opacity: 0.8; transform: scale(0.98); }
.btn-new:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; }

.btn-sage {
  background: var(--sage);
  color: rgba(255,255,255,0.92);
  box-shadow: 0 3px 16px rgba(74,122,90,0.18);
}
.btn-sage:hover:not(:disabled) { background: var(--sage2); transform: translateY(-1px); }

.btn-rust {
  background: var(--rust);
  color: rgba(255,255,255,0.90);
  box-shadow: 0 3px 14px rgba(138,74,42,0.16);
}
.btn-rust:hover:not(:disabled) { background: var(--rust2); transform: translateY(-1px); }

.btn-ghost-new {
  background: transparent;
  border: 1px solid var(--borderA);
  border-radius: 8px;
  color: var(--muted);
  font-family: 'Heebo', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s;
}
.btn-ghost-new:hover { border-color: rgba(200,190,168,0.30); color: var(--paper); }

.btn-gold-grad {
  background: linear-gradient(135deg, #7A5C14 0%, #C49A2C 50%, #7A5C14 100%);
  color: #1A1614;
  border-radius: 8px;
  border: none;
  box-shadow: 0 3px 14px rgba(196,154,44,0.15);
  font-family: 'Heebo', sans-serif;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.16s;
}
.btn-gold-grad:disabled { opacity: 0.3; cursor: not-allowed; }

/* ─── SHARED INPUT ───────────────────────────────────────────── */
.input-new {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--paper);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  padding: 12px 13px;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.input-new:focus {
  border-color: var(--sage);
  box-shadow: 0 0 0 3px rgba(74,122,90,0.10);
}
.input-new::placeholder { color: var(--muted); }

/* ─── MUTED LABEL ────────────────────────────────────────────── */
.label-muted {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* ─── SCROLLBAR HIDE ─────────────────────────────────────────── */
.scroll-hide { scrollbar-width: none; }
.scroll-hide::-webkit-scrollbar { display: none; }

/* ─── SCREEN ENTER ANIMATION ─────────────────────────────────── */
@keyframes screen-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.screen-enter { animation: screen-up 0.32s ease both; }
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/styles/fonts.css
git commit -m "feat(design): replace tokens with warm charcoal/sage/gold palette, add grain texture and shared surface/btn/input classes"
```

---

## Task 1: Auth Screen

**Files:**
- Modify: `src/styles/auth.css`
- Modify: `src/components/Auth.tsx`

The auth screen needs: split "Pocket / Ace" logo, floating suit symbols, big bg ♠, `.surface` card wrapping the form, new tab toggle, new input style, new CTA button.

**Keep:** All OTP verify logic, `sendOtp`, `verifyEmailOtp`, Framer Motion transitions, error display, resend flow.

- [ ] **Step 1: Replace auth.css**

Overwrite `src/styles/auth.css` completely:

```css
/* ─── AUTH SCREEN ─────────────────────────────────────────── */
.auth-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 50% 30%, rgba(74,122,90,0.09) 0%, var(--bg0) 65%);
  padding: var(--safe-top) 28px var(--safe-bottom);
  position: relative;
  overflow: hidden;
  direction: rtl;
}

/* Big bg spade */
.auth-bg-spade {
  position: absolute;
  left: 50%; bottom: -60px;
  transform: translateX(-50%);
  font-size: 340px;
  font-family: serif;
  color: rgba(200,190,168,0.025);
  user-select: none;
  pointer-events: none;
  line-height: 1;
}

/* Floating suit symbols */
.auth-suit {
  position: absolute;
  font-family: serif;
  user-select: none;
  pointer-events: none;
}
@keyframes auth-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.auth-inner {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

/* Logo */
.auth-logo-wrap {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo-text {
  font-family: 'Heebo', sans-serif;
  font-weight: 900;
  font-size: 64px;
  letter-spacing: -0.04em;
  line-height: 0.88;
  color: var(--paper);
}

.auth-logo-ace { color: var(--sage2); }

.auth-logo-sub {
  color: var(--muted);
  font-size: 12px;
  margin-top: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* Card */
.auth-card {
  width: 100%;
  padding: 24px;
  animation: scale-in 0.3s 0.1s ease both;
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.94); }
  to   { opacity: 1; transform: scale(1); }
}

/* Tab toggle */
.auth-tab-switcher {
  display: flex;
  background: var(--bg3);
  border-radius: 7px;
  padding: 3px;
  width: 100%;
  margin-bottom: 20px;
}

.auth-tab {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Heebo', sans-serif;
  font-weight: 700;
  font-size: 13px;
  transition: all 0.2s;
  background: transparent;
  color: var(--muted);
}

.auth-tab.active {
  background: var(--sage);
  color: rgba(255,255,255,0.92);
  box-shadow: 0 2px 10px rgba(74,122,90,0.20);
}

/* Inputs area */
.auth-inputs {
  display: flex;
  flex-direction: column;
  gap: 13px;
  width: 100%;
}

.auth-input-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 5px;
}

/* Reuse .input-new for actual inputs */

/* CTA */
.auth-cta {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  margin-top: 4px;
}

/* Error */
.auth-error {
  color: var(--rust2);
  font-size: 12px;
  text-align: center;
  margin: 0;
}

/* Divider / switch link */
.auth-divider {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  width: 100%;
  text-align: center;
  font-size: 11px;
  color: var(--dimmer);
}
.auth-divider span {
  color: rgba(74,122,90,0.7);
  font-weight: 600;
  cursor: pointer;
}

/* OTP verify */
.auth-verify-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--paper);
  margin: 0 0 6px;
  text-align: center;
}
.auth-verify-sub {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  margin: 0 0 24px;
}
.auth-otp-input {
  width: 180px;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.2em;
  padding: 14px 12px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--paper);
  margin: 16px 0 8px;
  outline: none;
  font-family: 'IBM Plex Mono', monospace;
  caret-color: var(--sage);
}
.auth-otp-input:focus {
  border-color: var(--sage);
  box-shadow: 0 0 0 3px rgba(74,122,90,0.10);
}

.auth-link {
  font-size: 11px;
  color: var(--dimmer);
  text-align: center;
  cursor: default;
  margin-top: 1.5rem;
  display: flex;
  gap: 1.5rem;
}
.auth-link span {
  color: rgba(74,122,90,0.7);
  font-weight: 600;
  cursor: pointer;
}

/* Logo-card icon (used on verify step) */
.auth-logo-card {
  width: 64px; height: 64px;
  border-radius: 18px;
  background: var(--sage-bg);
  border: 1.5px solid rgba(74,122,90,0.30);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px;
  margin-bottom: 14px;
}
```

- [ ] **Step 2: Update Auth.tsx — add logo split, floating suits, use new classes**

Replace only the JSX `return` block in `src/components/Auth.tsx` (keep all the logic above it unchanged). The new return:

```tsx
return (
  <div className="auth-screen">
    {/* Big background spade */}
    <div className="auth-bg-spade">♠</div>

    {/* Floating suits */}
    {(['♠', '♣', '♥', '♦'] as const).map((suit, i) => (
      <div
        key={suit}
        className="auth-suit"
        style={{
          fontSize: [60, 44, 52, 40][i],
          color: `rgba(200,190,168,${[0.04, 0.03, 0.035, 0.025][i]})`,
          top:  ['8%', '70%', '60%', '18%'][i],
          left: ['5%', '76%',  '7%', '80%'][i],
          animation: `auth-float ${[4, 4.8, 5.2, 4.4][i]}s ease-in-out infinite`,
          animationDelay: `${[0, 0.7, 1.3, 0.4][i]}s`,
        }}
      >
        {suit}
      </div>
    ))}

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
            {/* Split logo */}
            <div className="auth-logo-wrap">
              <div className="auth-logo-text">
                Pocket<br />
                <span className="auth-logo-ace">Ace</span>
              </div>
              <div className="auth-logo-sub">ניהול שולחן פוקר</div>
            </div>

            {/* Card */}
            <div className="auth-card surface">
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

              <form className="auth-inputs" onSubmit={handleEmailSubmit}>
                {!isLogin && (
                  <div>
                    <div className="auth-input-label">שם / כינוי</div>
                    <input
                      className="input-new"
                      type="text"
                      placeholder="איך קוראים לך?"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                      style={{ direction: 'rtl' }}
                    />
                  </div>
                )}
                <div>
                  <div className="auth-input-label">אימייל</div>
                  <input
                    className="input-new"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button
                  className="btn-new btn-sage auth-cta"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        טוען...
                      </span>
                    : isLogin ? 'כנס ♠' : 'הצטרף ♠'
                  }
                </button>
              </form>

              <div className="auth-divider">
                {isLogin
                  ? <span onClick={() => { setIsLogin(false); setError(''); }}>פתח חשבון — זה שניה</span>
                  : <span onClick={() => { setIsLogin(true);  setError(''); }}>כבר יש לך חשבון? כנסו</span>
                }
              </div>
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
            <div className="auth-logo-card">📧</div>
            <h2 className="auth-verify-title">הזן את הקוד</h2>
            <p className="auth-verify-sub">שלחנו קוד בן 6 ספרות ל־{email}</p>

            <input
              ref={codeInputRef}
              className="auth-otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={e => handleCodeChange(e.target.value)}
              placeholder="000000"
              dir="ltr"
              disabled={loading}
              autoComplete="one-time-code"
            />

            {error && <p className="auth-error">{error}</p>}
            {loading && <p className="auth-verify-sub">מאמת...</p>}

            <div className="auth-link">
              <span onClick={handleResend}>שלח שוב</span>
              <span onClick={() => { setStep('initial'); setCode(''); setError(''); }}>← חזור</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
  </div>
);
```

Also add the `@keyframes spin` import note: since we added the `<style>` tag inline, no separate file change is needed. Alternatively add `@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }` to auth.css instead of the inline `<style>` tag.

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/auth.css src/components/Auth.tsx
git commit -m "feat(design): restyle auth screen — split logo, floating suits, surface card, sage tab toggle"
```

---

## Task 2: Lobby Screen

**Files:**
- Modify: `src/styles/lobby.css`

**Keep:** All existing Lobby.tsx logic — regulars crew, history, status badge, credits, logout.

- [ ] **Step 1: Replace lobby.css**

Overwrite `src/styles/lobby.css` completely:

```css
/* ─── LOBBY ───────────────────────────────────────────────── */
.lobby-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at 50% 15%, rgba(74,122,90,0.07) 0%, var(--bg0) 55%);
  overflow: hidden;
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

/* ── Top bar ── */
.lobby-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 18px 10px;
  flex-shrink: 0;
}

.lobby-greeting-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.lobby-greeting-name {
  font-size: 24px;
  font-weight: 900;
  color: var(--paper);
  letter-spacing: -0.02em;
  margin-top: 3px;
}

/* Exit ghost button */
.lobby-exit-btn {
  padding: 7px 14px;
  font-size: 12px;
  background: transparent;
  border: 1px solid var(--borderA);
  border-radius: 8px;
  color: var(--muted);
  font-family: 'Heebo', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s;
  flex-shrink: 0;
}
.lobby-exit-btn:hover { border-color: rgba(200,190,168,0.30); color: var(--paper); }

/* ── Scrollable body ── */
.lobby-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 18px 32px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.lobby-scroll::-webkit-scrollbar { display: none; }

/* ── CTA ── */
.lobby-cta {
  width: 100%;
  padding: 19px;
  font-size: 18px;
  background: var(--sage);
  color: rgba(255,255,255,0.92);
  border: none;
  border-radius: 8px;
  font-family: 'Heebo', sans-serif;
  font-weight: 900;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 0 3px 16px rgba(74,122,90,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.16s;
}
.lobby-cta:hover { background: var(--sage2); transform: translateY(-1px); }
.lobby-cta:active { opacity: 0.8; transform: scale(0.98); }

/* ── Stats 3-col grid ── */
.lobby-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.lobby-stat-cell {
  padding: 14px 8px;
  text-align: center;
}
.lobby-stat-cell:not(:last-child) {
  border-left: 1px solid var(--border);
}

.lobby-stat-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--paper);
}
.lobby-stat-value.sage  { color: var(--sage2); }
.lobby-stat-value.gold  { color: var(--gold); }
.lobby-stat-label {
  font-size: 9px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
}

/* ── Section label ── */
.lobby-section-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 10px;
}

/* ── History cards ── */
.lobby-history-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.lobby-history-item {
  padding: 13px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  width: 100%;
  text-align: right;
  border-right: 3px solid var(--sage);
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  transition: opacity 0.15s;
}
.lobby-history-item::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,190,168,0.12), transparent);
}
.lobby-history-item.loss { border-right-color: var(--rust); }

.lobby-history-title { font-size: 14px; font-weight: 700; color: var(--paper); }
.lobby-history-sub   { font-size: 10px; color: var(--muted); margin-top: 3px; }

.lobby-history-amount {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 17px;
  font-weight: 700;
  flex-shrink: 0;
}
.lobby-history-amount.win  { color: var(--sage2); }
.lobby-history-amount.loss { color: var(--rust2); }

/* ── Status badge (cumulative status) ── */
.lobby-status-badge {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 8px 0 0;
}

/* ── Crew section ── (keep existing crew styles, just retint) ── */
.lobby-crew {
  padding: 0;
}

.lobby-crew-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
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
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.15s ease;
}

.lobby-crew-avatar.selected {
  box-shadow: 0 0 0 2.5px var(--sage), 0 4px 12px rgba(74,122,90,0.30) !important;
}

.lobby-crew-avatar.pending-remove {
  box-shadow: 0 0 0 2.5px var(--rust), 0 0 14px rgba(138,74,42,0.35) !important;
}

.lobby-crew-check {
  position: absolute;
  bottom: -2px; right: -2px;
  background: var(--sage);
  color: #fff;
  border-radius: 50%;
  width: 14px; height: 14px;
  font-size: 8px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}

.lobby-crew-name { font-size: 9px; color: var(--muted); }

.lobby-crew-remove-tip {
  position: absolute;
  top: -26px; left: 50%;
  transform: translateX(-50%);
  background: rgba(138,74,42,0.92);
  color: #fff;
  font-size: 9px; font-weight: 700;
  padding: 3px 7px;
  border-radius: 6px;
  white-space: nowrap;
  cursor: pointer;
  z-index: 10;
}

.lobby-crew-add {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--bg3);
  border: 1.5px dashed var(--borderA);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--dimmer);
  cursor: pointer;
}

/* ── CTA badge (selected count) ── */
.lobby-cta-badge {
  background: rgba(0,0,0,0.25);
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
}

/* ── Bottom sheet (add regular) ── */
.lobby-sheet-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 100;
  display: flex; align-items: flex-end;
}

.lobby-sheet-card {
  width: 100%;
  background: var(--bg1);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--border);
  padding: 20px 18px 32px;
  direction: rtl;
}

.lobby-sheet-title { font-size: 18px; font-weight: 900; color: var(--paper); margin: 0 0 16px; }

.lobby-add-regular-input {
  width: 100%;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  color: var(--paper);
  font-family: 'Heebo', sans-serif;
  outline: none;
  direction: rtl;
  box-sizing: border-box;
  margin-bottom: 12px;
  transition: border-color 0.18s;
}
.lobby-add-regular-input:focus { border-color: var(--sage); }

.lobby-add-regular-btn {
  width: 100%;
  background: var(--sage);
  color: rgba(255,255,255,0.92);
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  font-family: 'Heebo', sans-serif;
  box-shadow: 0 3px 16px rgba(74,122,90,0.18);
}

/* ── Logout ── */
.lobby-logout {
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border);
  display: flex; justify-content: center;
  flex-shrink: 0;
}

.lobby-logout-btn {
  font-size: 11px; color: var(--dimmer);
  display: flex; align-items: center; gap: 4px;
  cursor: pointer; background: none; border: none;
  font-family: inherit;
}

/* ── Premium / store section ── */
.lobby-store-teaser {
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex; align-items: center; justify-content: space-between;
}

.lobby-store-title { font-size: 11px; font-weight: 700; color: var(--gold); }
.lobby-store-sub   { font-size: 9px; color: var(--muted); margin-top: 1px; }

.lobby-store-btn {
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  color: var(--gold);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px; font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

/* Ad banner placeholder */
.lobby-ad-banner { height: 60px; flex-shrink: 0; }

/* Premium section */
.lobby-premium-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.lobby-premium-btn {
  width: 100%;
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  color: var(--gold);
  padding: 14px 20px;
  border-radius: 10px;
  font-family: 'Heebo', sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.lobby-restore-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  text-decoration: underline;
}

/* ── Lobby.tsx also uses these stat aliases ── */
.lobby-stat-card { /* legacy alias used in JSX */ }
.lobby-stat-card.green { }
.lobby-stat-card.yellow { }
.lobby-stat-value.green { color: var(--sage2); }
.lobby-stat-value.yellow { color: var(--gold); }
```

- [ ] **Step 2: Update Lobby.tsx — replace topbar and stats markup**

In `src/components/Lobby.tsx`, locate the return JSX and make these targeted replacements:

**2a. Replace the topbar section.** Find the `<div className="lobby-topbar">` block and replace it:

```tsx
<div className="lobby-topbar">
  <div>
    <div className="lobby-greeting-label">שלום,</div>
    <div className="lobby-greeting-name">{firstName}</div>
  </div>
  <button className="lobby-exit-btn" onClick={onLogout}>יציאה</button>
</div>
```

**2b. Replace the stats section.** Find the `<div className="lobby-stats">` block and replace with a surface card using the new 3-column grid:

```tsx
<div className="surface lobby-stats-grid">
  <div className="lobby-stat-cell">
    <div className="lobby-stat-value">{recentGames.length}</div>
    <div className="lobby-stat-label">משחקים</div>
  </div>
  <div className="lobby-stat-cell">
    <div className={`lobby-stat-value ${cumulative >= 0 ? 'sage' : ''}`}>
      {cumulative >= 0 ? '+' : ''}{cumulative.toFixed(0)}₪
    </div>
    <div className="lobby-stat-label">רווח כולל</div>
  </div>
  <div className="lobby-stat-cell">
    <div className="lobby-stat-value gold">{status.badge || '🃏'}</div>
    <div className="lobby-stat-label">סטטוס</div>
  </div>
</div>
```

**2c. Replace history items.** Find the history list rendering and update each item:

```tsx
<div className="lobby-history-list">
  {recentGames.map((game, i) => {
    const userResult = game.playerResults?.find(p => p.name === user.name);
    const pl = userResult?.profitLossAfterFee ?? 0;
    return (
      <button
        key={game.id}
        className={`lobby-history-item ${pl < 0 ? 'loss' : ''}`}
        onClick={() => setSelectedGame(selectedGame?.id === game.id ? null : game)}
        style={{ animationDelay: `${i * 0.07}s` }}
      >
        <div>
          <div className="lobby-history-title">{game.hostsName}</div>
          <div className="lobby-history-sub">
            {new Date(game.date).toLocaleDateString('he-IL')} · ₪{game.totalPot}
          </div>
        </div>
        <div className={`lobby-history-amount ${pl >= 0 ? 'win' : 'loss'}`}>
          {pl >= 0 ? '+' : ''}{pl.toFixed(0)}₪
        </div>
      </button>
    );
  })}
</div>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/lobby.css src/components/Lobby.tsx
git commit -m "feat(design): restyle lobby — greeting header, surface stats grid, history cards with sage/rust right border"
```

---

## Task 3: Game Setup Screen

**Files:**
- Modify: `src/styles/setup.css`

**Keep:** All GameSetup.tsx logic — buy-in stepper, quick-select pills, player list, regulars import, start CTA.

- [ ] **Step 1: Replace setup.css**

Overwrite `src/styles/setup.css`:

```css
/* ─── GAME SETUP ──────────────────────────────────────────── */
.setup-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg0);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

/* ── Header ── */
.setup-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.setup-back {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 20px;
  padding: 0 4px 0 0;
  line-height: 1;
  font-family: 'IBM Plex Mono', monospace;
}

.setup-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--paper);
  letter-spacing: -0.01em;
  margin: 0;
}

.setup-title-sub {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-top: 2px;
}

/* ── Body ── */
.setup-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.setup-body::-webkit-scrollbar { display: none; }

.setup-section-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 14px;
}

/* ── Buy-in stepper card ── */
.setup-buyin-card {
  padding: 18px;
}

.setup-stepper-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setup-stepper-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--paper);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'IBM Plex Mono', monospace;
  transition: all 0.15s;
}
.setup-stepper-btn:hover { border-color: var(--borderA); }
.setup-stepper-btn:active { transform: scale(0.95); }

.setup-stepper-value {
  flex: 1;
  text-align: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 40px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: -0.02em;
  background: transparent;
  border: none;
  outline: none;
  -moz-appearance: textfield;
}
.setup-stepper-value::-webkit-outer-spin-button,
.setup-stepper-value::-webkit-inner-spin-button { -webkit-appearance: none; }

/* Quick-select pills */
.setup-pills {
  display: flex;
  gap: 6px;
  margin-top: 14px;
  justify-content: center;
}

.setup-pill {
  padding: 6px 11px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  transition: all 0.15s;
}
.setup-pill.active {
  border-color: #7A5C14;
  background: rgba(196,154,44,0.10);
  color: var(--gold);
}

/* ── Players section ── */
.setup-players-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.setup-players { display: flex; flex-direction: column; gap: 7px; }

.setup-player-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border-right: 3px solid var(--sage);
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}
.setup-player-row::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,190,168,0.12), transparent);
}

.setup-player-index {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--gold);
  width: 20px;
  flex-shrink: 0;
  font-weight: 600;
}

.setup-player-name-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Heebo', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--paper);
  direction: rtl;
}
.setup-player-name-input::placeholder { color: var(--muted); }

.setup-player-remove {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 2px;
}

/* Add player ghost row */
.setup-add-row {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--borderA);
  border-radius: 8px;
  color: var(--muted);
  font-family: 'Heebo', sans-serif;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.16s;
  margin-top: 2px;
}
.setup-add-row:hover { border-color: rgba(200,190,168,0.30); color: var(--paper); }

/* Legacy classes kept for compat with existing JSX */
.setup-section-label { }
.setup-stepper-card { }
.setup-steppers { }
.setup-stepper-label { }
.setup-stepper-center { }
.setup-stepper-currency { }
.setup-rate-pill {
  margin-top: 8px;
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  border-radius: 8px;
  padding: 8px 12px;
  text-align: center;
  font-size: 11px;
  color: rgba(196,154,44,0.7);
  font-weight: 600;
}
.setup-player-avatar { }
.setup-player-host-badge {
  font-size: 9px;
  background: var(--gold);
  color: #1A1614;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 700;
}
.setup-player-remove { }
.setup-add-icon { }
.setup-add-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: var(--muted);
  font-family: inherit;
  direction: rtl;
}
.setup-add-input::placeholder { color: var(--muted); }
.setup-add-input:focus { color: var(--paper); }

/* ── Footer ── */
.setup-footer {
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.setup-cta {
  width: 100%;
  background: var(--sage);
  color: rgba(255,255,255,0.92);
  border: none;
  padding: 17px;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 900;
  cursor: pointer;
  font-family: 'Heebo', sans-serif;
  box-shadow: 0 3px 16px rgba(74,122,90,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.setup-cta:disabled { opacity: 0.3; cursor: not-allowed; }
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: `✓ built`.

- [ ] **Step 3: Commit**

```bash
git add src/styles/setup.css
git commit -m "feat(design): restyle setup screen — circular stepper, gold pills, player rows with sage right border"
```

---

## Task 4: Game Table Screen

**Files:**
- Modify: `src/styles/table.css`
- Modify: `src/components/GameTable.tsx`

**Keep:** All buy-in logic, `onAddBuyIn`, `onEndGame`, `onQuit`, Toast, Framer Motion, player card interaction.

**Change:**
- `PLAYER_COLORS` palettes → match design (red/green/blue/purple/gold/teal shades)
- Layout: from 2-col card grid → list rows with chip stack
- Add `ChipStack` component
- Add game clock (was missing in current app — add as a display-only `useEffect` timer)
- Restyle header to show dominant clock + pot underneath
- `+קנייה` → amber ghost style; end game → rust full-width

- [ ] **Step 1: Replace table.css**

Overwrite `src/styles/table.css`:

```css
/* ─── GAME TABLE ──────────────────────────────────────────── */
.game-table-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at 50% 50%, rgba(74,122,90,0.06) 0%, var(--bg0) 65%);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
  overflow: hidden;
}

/* ── Clock header ── */
.table-header {
  border-bottom: 1px solid var(--border);
  background: var(--bg1);
  flex-shrink: 0;
}

.table-clock-wrap {
  padding: 20px 20px 10px;
  text-align: center;
}

.table-clock-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin-bottom: 5px;
}

.table-clock {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 58px;
  font-weight: 700;
  color: var(--sage2);
  letter-spacing: 0.04em;
  line-height: 1;
}

.table-pot-row {
  padding: 0 18px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-pot-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.table-pot-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 19px;
  font-weight: 700;
  color: var(--gold);
  margin-top: 2px;
}

/* ── Player list ── */
.table-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.table-list::-webkit-scrollbar { display: none; }

/* Player row — 4-col grid: chip-stack | name+buyins | balance | +btn */
.table-player-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 14px 15px;
  border-right: 3px solid var(--sage);
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}
.table-player-row::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,190,168,0.12), transparent);
}
.table-player-row.leader { border-right-color: var(--gold); }

.table-player-name {
  font-weight: 800;
  font-size: 16px;
  color: var(--paper);
  letter-spacing: -0.01em;
}
.table-player-row.leader .table-player-name { color: var(--gold); }

.table-player-sub {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 2px;
}

.table-player-balance {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 20px;
  color: var(--sage2);
}

/* +קנייה amber ghost button */
.table-buyin-btn {
  padding: 7px 11px;
  font-size: 11px;
  white-space: nowrap;
  background: transparent;
  border: 1px solid rgba(196,154,44,0.20);
  border-radius: 8px;
  color: rgba(196,154,44,0.70);
  font-family: 'Heebo', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.table-buyin-btn:hover {
  border-color: rgba(196,154,44,0.40);
  color: var(--gold);
}
.table-buyin-btn:active { transform: scale(0.96); }

/* ── Footer ── */
.table-footer {
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.table-end-btn {
  width: 100%;
  background: var(--rust);
  color: rgba(255,255,255,0.90);
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  font-family: 'Heebo', sans-serif;
  box-shadow: 0 3px 14px rgba(138,74,42,0.16);
  transition: all 0.16s;
}
.table-end-btn:hover { background: var(--rust2); transform: translateY(-1px); }
.table-end-btn:active { opacity: 0.8; transform: scale(0.98); }

/* ── End-game confirm modal ── */
.table-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(4px);
}

.table-modal-card {
  width: 100%;
  max-width: 290px;
  padding: 26px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.40);
}

.table-modal-title {
  font-weight: 900;
  font-size: 18px;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
  color: var(--paper);
}

.table-modal-sub {
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 20px;
  line-height: 1.5;
}

.table-modal-btns {
  display: flex;
  gap: 9px;
}

.table-modal-continue {
  flex: 1;
  padding: 12px;
  font-size: 13px;
  background: transparent;
  border: 1px solid var(--borderA);
  border-radius: 8px;
  color: var(--muted);
  font-family: 'Heebo', sans-serif;
  font-weight: 600;
  cursor: pointer;
}

.table-modal-close {
  flex: 1;
  padding: 12px;
  font-size: 13px;
  background: var(--rust);
  border: none;
  border-radius: 8px;
  color: rgba(255,255,255,0.90);
  font-family: 'Heebo', sans-serif;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 14px rgba(138,74,42,0.16);
}

/* ── Chip stack ── */
.chip-stack {
  position: relative;
  flex-shrink: 0;
  align-self: flex-end;
}

.chip-disc {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-spade {
  font-family: serif;
  font-size: 11px;
  color: rgba(255,255,255,0.50);
}

/* Legacy class aliases so unchanged JSX doesn't break */
.table-grid { display: flex; flex-direction: column; gap: 8px; padding: 14px 18px; flex:1; overflow-y:auto; }
.player-card { display: none; } /* replaced by table-player-row */
.table-bottom { display: none; }
.table-header-left { }
.table-header-label { }
.table-header-pot { }
.table-player-count { }
.table-quit-btn { display: none; }
```

- [ ] **Step 2: Update GameTable.tsx — swap PLAYER_COLORS, add ChipStack, add clock, restyle JSX**

Replace `PLAYER_COLORS` array at the top of `src/components/GameTable.tsx` and add `ChipStack` component and clock state. Here is the full updated file:

```tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, GameSettings } from '../types';
import { Toast } from './Toast';
import '../styles/table.css';

// Design-handoff palettes: one hue, multiple shades per player
const CHIP_PALETTES = [
  ['#C44B30', '#E05A3A', '#A03820', '#D4624A', '#8A2810'], // red
  ['#2A5C38', '#3A7A4C', '#1E4428', '#4A9060', '#163220'], // green
  ['#1A3A8A', '#2A4EAA', '#122A6A', '#3A62C0', '#0E1E50'], // blue
  ['#7A3A8A', '#9A4EAA', '#5A2868', '#B060C0', '#401C50'], // purple
  ['#B87A10', '#D49020', '#8A5A08', '#E0A830', '#604004'], // gold
  ['#2A7A8A', '#3A9AAA', '#1C5A68', '#4AB0C0', '#123840'], // teal
];

// Deterministic wobble seeded by player+chip index so it never shifts on re-render
function jitter(playerIdx: number, i: number, range: number): number {
  const seed = (playerIdx * 7 + i * 13) % 17;
  return (seed / 17 - 0.5) * range;
}

interface ChipStackProps {
  buyIns: number;
  playerIdx: number;
}

function ChipStack({ buyIns, playerIdx }: ChipStackProps) {
  const palette = CHIP_PALETTES[playerIdx % CHIP_PALETTES.length];
  const count = Math.min(buyIns, 6);
  const size = 30;
  const totalH = size + count * 5 + 8;

  return (
    <div className="chip-stack" style={{ width: size + 10, height: totalH }}>
      {Array.from({ length: count }).map((_, i) => {
        const dx = jitter(playerIdx, i, 3);
        const dy = jitter(playerIdx, i + 5, 1);
        const rot = jitter(playerIdx, i + 11, 4);
        return (
          <div
            key={i}
            className="chip-disc"
            style={{
              bottom: i * 5 + dy,
              left: 5 + dx,
              width: size,
              height: size,
              background: palette[i % palette.length],
              border: '1.5px solid rgba(255,255,255,0.12)',
              boxShadow: `${dx * 0.3}px 2px 5px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.12)`,
              transform: `rotate(${rot}deg)`,
            }}
          >
            {i === count - 1 && <span className="chip-spade" style={{ transform: `rotate(${-rot}deg)` }}>♠</span>}
          </div>
        );
      })}
    </div>
  );
}

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

interface GameTableProps {
  players: Player[];
  settings: GameSettings;
  onAddBuyIn: (playerId: string) => void;
  onEndGame: () => void;
  onQuit: () => void;
  onHome: () => void;
}

export const GameTable: React.FC<GameTableProps> = ({ players, settings, onAddBuyIn, onEndGame }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const handleAddBuyIn = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) setToastMessage(`✓ Buy-in הוסף ל${player.name}!`);
    onAddBuyIn(playerId);
  };

  const totalPot = players.reduce((sum, p) => sum + p.totalInvested, 0);

  return (
    <div className="game-table-screen">
      {/* Clock header */}
      <div className="table-header">
        <div className="table-clock-wrap">
          <div className="table-clock-label">זמן משחק</div>
          <div className="table-clock">{fmtTime(elapsed)}</div>
        </div>
        <div className="table-pot-row">
          <div>
            <div className="table-pot-label">על השולחן</div>
            <div className="table-pot-value">₪{totalPot.toLocaleString('he-IL')}</div>
          </div>
        </div>
      </div>

      {/* Player list */}
      <div className="table-list">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            className={`table-player-row${index === 0 ? ' leader' : ''}`}
            style={{ animationDelay: `${index * 0.06}s` }}
            whileTap={{ scale: 0.99 }}
          >
            <ChipStack buyIns={player.buyIns} playerIdx={index} />
            <div>
              <div className="table-player-name">{player.name}</div>
              <div className="table-player-sub">×{player.buyIns} קנייה</div>
            </div>
            <div className="table-player-balance">₪{player.totalInvested.toLocaleString('he-IL')}</div>
            <button className="table-buyin-btn" onClick={() => handleAddBuyIn(player.id)}>
              + קנייה
            </button>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="table-footer">
        <button className="table-end-btn" onClick={() => setShowEndModal(true)}>
          סגור שולחן
        </button>
      </div>

      {/* End-game confirm modal */}
      <AnimatePresence>
        {showEndModal && (
          <div className="table-modal-overlay" onClick={() => setShowEndModal(false)}>
            <motion.div
              className="surface table-modal-card"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="table-modal-title">לסגור את השולחן?</div>
              <div className="table-modal-sub">תועברו לספירת הצ'יפים</div>
              <div className="table-modal-btns">
                <button className="table-modal-continue" onClick={() => setShowEndModal(false)}>המשך</button>
                <button className="table-modal-close" onClick={() => { setShowEndModal(false); onEndGame(); }}>סגור</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/table.css src/components/GameTable.tsx
git commit -m "feat(design): restyle table screen — clock header, list layout, ChipStack component, amber +קנייה, rust end button"
```

---

## Task 5: EndGame (Chip Count) Screen

**Files:**
- Modify: `src/styles/endgame.css`

**Keep:** All EndGame.tsx logic — `counts` state, `isValid`, `allFilled`, `handleCalc`.

- [ ] **Step 1: Replace endgame.css**

Overwrite `src/styles/endgame.css`:

```css
/* ─── END GAME (CHIP COUNT) ───────────────────────────────── */
.endgame-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg0);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

/* ── Header ── */
.endgame-header {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.endgame-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--paper);
  letter-spacing: -0.01em;
  margin: 0;
}

.endgame-back {
  font-size: 11px;
  color: var(--dimmer);
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
}

/* ── Validation bar ── */
.endgame-validation-wrap {
  padding: 12px 18px;
  flex-shrink: 0;
}

.endgame-validation {
  padding: 13px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-right: 3px solid var(--border);
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-radius: 10px;
  transition: border-right-color 0.3s, border-color 0.3s;
  position: relative;
  overflow: hidden;
}
.endgame-validation::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,190,168,0.12), transparent);
}
.endgame-validation.valid {
  border-right-color: var(--sage);
  border-color: rgba(74,122,90,0.20);
}
.endgame-validation.invalid {
  border-right-color: var(--rust);
  border-color: rgba(138,74,42,0.20);
}

.endgame-validation-col { }

.endgame-validation-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.endgame-validation-value {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: var(--gold);
  margin-top: 2px;
}

.endgame-validation-status {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--muted);
  text-align: center;
}
.endgame-validation-status.valid   { color: var(--sage2); }
.endgame-validation-status.invalid { color: var(--rust2); }

.endgame-validation-entered {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  margin-top: 2px;
  color: var(--muted);
  text-align: left;
}
.endgame-validation-entered.valid   { color: var(--sage2); }
.endgame-validation-entered.invalid { color: var(--rust2); }

/* ── Body ── */
.endgame-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 18px 10px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.endgame-body::-webkit-scrollbar { display: none; }

/* ── Player row ── */
.endgame-player-row {
  padding: 13px 14px;
  border-right: 3px solid var(--sage);
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}
.endgame-player-row::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,190,168,0.12), transparent);
}

.endgame-player-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.endgame-player-info { flex: 1; }
.endgame-player-name {
  font-size: 15px;
  font-weight: 800;
  color: var(--paper);
  letter-spacing: -0.01em;
}
.endgame-player-invested {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

/* − / input / + controls */
.endgame-stepper {
  display: flex;
  align-items: center;
  gap: 7px;
}

.endgame-stepper-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--paper);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'IBM Plex Mono', monospace;
  transition: all 0.15s;
}
.endgame-stepper-btn:hover { border-color: var(--borderA); }

.endgame-input-wrap {
  position: relative;
}

.endgame-stepper-value {
  width: 82px;
  padding: 7px 8px;
  text-align: center;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--paper);
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}
.endgame-stepper-value::-webkit-outer-spin-button,
.endgame-stepper-value::-webkit-inner-spin-button { -webkit-appearance: none; }
.endgame-stepper-value.filled { border-color: var(--sage); }

.endgame-chips-label {
  position: absolute;
  bottom: -14px;
  left: 0; right: 0;
  text-align: center;
  font-size: 8px;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── Footer ── */
.endgame-footer {
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.endgame-cta {
  width: 100%;
  padding: 17px;
  font-size: 16px;
  background: linear-gradient(135deg, #7A5C14 0%, #C49A2C 50%, #7A5C14 100%);
  color: #1A1614;
  border: none;
  border-radius: 8px;
  font-family: 'Heebo', sans-serif;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 3px 14px rgba(196,154,44,0.15);
}
.endgame-cta:disabled { opacity: 0.3; cursor: not-allowed; }

/* Legacy aliases */
.endgame-total-pill { display: none; }
.endgame-total-label { }
.endgame-total-value { }
.endgame-player-avatar { display: none; }
.endgame-validation-label { }
.endgame-validation-value { }
.endgame-validation-value.valid   { }
.endgame-validation-value.invalid { }
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: `✓ built`.

- [ ] **Step 3: Commit**

```bash
git add src/styles/endgame.css
git commit -m "feat(design): restyle endgame screen — validation bar with sage/rust transitions, circular steppers, gold gradient CTA"
```

---

## Task 6: Results Screen

**Files:**
- Modify: `src/styles/results.css`

**Keep:** All SettlementResults.tsx logic — confetti, winner insult, WhatsApp share, animations, `onPlayAgain`.

- [ ] **Step 1: Replace results.css**

Overwrite `src/styles/results.css`:

```css
/* ─── SETTLEMENT RESULTS ──────────────────────────────────── */
.results-screen {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at 50% 10%, rgba(196,154,44,0.06) 0%, var(--bg0) 55%);
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  direction: rtl;
}

/* ── Header ── */
.results-header {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.results-title {
  font-size: 22px;
  font-weight: 900;
  color: var(--paper);
  letter-spacing: -0.02em;
  margin: 0;
}

.results-pot-badge {
  background: rgba(196,154,44,0.08);
  border: 1px solid rgba(196,154,44,0.18);
  border-radius: 8px;
  padding: 5px 12px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  color: var(--gold);
  font-size: 14px;
}

/* ── Body ── */
.results-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 18px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.results-body::-webkit-scrollbar { display: none; }

/* ── Player cards ── */
.results-player-row {
  padding: 15px 16px;
  border-right: 3px solid var(--sage);
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
}
.results-player-row::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,190,168,0.12), transparent);
}
.results-player-row.top-player {
  border-right-color: var(--gold);
  box-shadow: 0 4px 20px rgba(196,154,44,0.08);
}
.results-player-row.loser { border-right-color: var(--rust); }

.results-player-info { flex: 1; }

.results-player-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.results-player-name {
  font-weight: 900;
  font-size: 16px;
  color: var(--paper);
  letter-spacing: -0.01em;
}
.results-player-row.top-player .results-player-name { color: var(--gold); }

.results-player-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 5px;
  font-weight: 700;
  background: var(--sage-bg);
  color: var(--sage2);
}
.results-player-row.top-player .results-player-badge {
  background: rgba(196,154,44,0.10);
  color: var(--gold);
}
.results-player-row.loser .results-player-badge {
  background: var(--rust-bg);
  color: var(--rust2);
}

.results-player-sub {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.results-player-amount {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 800;
  font-size: 22px;
  color: var(--sage2);
  flex-shrink: 0;
}
.results-player-row.top-player .results-player-amount {
  font-size: 29px;
  color: var(--gold);
}
.results-player-row.loser .results-player-amount { color: var(--rust2); }

/* ── Section label ── */
.results-section-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 8px;
}

/* ── Debt rows ── */
.results-debts-card {
  padding: 2px 0;
}

.results-debt-row {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.results-debt-row:not(:last-child) {
  border-bottom: 1px solid var(--border);
}

.results-debt-from {
  font-weight: 700;
  color: var(--rust2);
  font-size: 14px;
}

.results-debt-middle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.results-debt-line-rust {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, var(--rust), transparent);
  opacity: 0.3;
}

.results-debt-line-sage {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, var(--sage));
  opacity: 0.3;
}

.results-debt-amount {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  color: var(--gold);
  font-size: 13px;
}

.results-debt-to {
  font-weight: 700;
  color: var(--sage2);
  font-size: 14px;
}

/* ── WhatsApp share ── */
.results-whatsapp {
  background: linear-gradient(135deg, rgba(37,211,102,0.12), rgba(37,211,102,0.04));
  border: 1px solid rgba(37,211,102,0.25);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
  text-align: right;
  font-family: inherit;
}

.results-whatsapp-icon  { font-size: 22px; }
.results-whatsapp-title { font-size: 12px; font-weight: 700; color: var(--paper); }
.results-whatsapp-sub   { font-size: 9px; color: var(--muted); margin-top: 1px; }
.results-whatsapp-arrow { margin-right: auto; font-size: 16px; color: var(--dimmer); }

/* ── Footer ── */
.results-footer {
  display: flex;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.results-home-btn {
  flex: 1;
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--borderA);
  padding: 13px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.16s;
}
.results-home-btn:hover { border-color: rgba(200,190,168,0.30); color: var(--paper); }

.results-again-btn {
  flex: 2;
  background: var(--sage);
  color: rgba(255,255,255,0.92);
  border: none;
  padding: 13px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  font-family: 'Heebo', sans-serif;
  box-shadow: 0 3px 16px rgba(74,122,90,0.18);
  transition: all 0.16s;
}
.results-again-btn:hover { background: var(--sage2); transform: translateY(-1px); }

/* ── Insult cards ── */
.results-winner-insult {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(74,122,90,0.15);
  font-size: 9px;
  font-style: italic;
  color: var(--muted);
  line-height: 1.4;
}

.results-loser-insult {
  padding: 8px 12px;
  background: var(--rust-bg);
  border: 1px solid rgba(138,74,42,0.15);
  border-radius: 8px;
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  font-style: italic;
}

/* ── Add-to-regulars inline btn ── */
.results-add-regular-btn {
  margin-right: auto;
  background: var(--gold-bg);
  border: 1px solid var(--gold-border);
  color: rgba(196,154,44,0.80);
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.results-add-regular-done {
  margin-right: auto;
  font-size: 9px;
  font-weight: 700;
  color: var(--sage2);
  flex-shrink: 0;
}

/* ── Confetti (unchanged mechanics, new colors) ── */
.results-confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

/* ── Animations (all existing animations kept) ── */
@keyframes res-pop-in {
  from { opacity: 0; transform: scale(0.85) translateY(-12px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

@keyframes res-avatar-bounce {
  from { opacity: 0; transform: rotate(-15deg) scale(0.4); }
  to   { opacity: 1; transform: rotate(0deg)   scale(1); }
}

@keyframes res-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes res-slide-in {
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Legacy hero winner card kept for backward compat */
.results-winner {
  margin: 0 0 8px;
  background: var(--sage-bg);
  border: 1px solid rgba(74,122,90,0.35);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  opacity: 0;
  animation: res-pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

.results-winner-bg { position: absolute; inset: 0; border-radius: 10px; overflow: hidden; pointer-events: none; }
.results-winner-bg::before { content: '🦈'; position: absolute; top: -10px; left: -10px; font-size: 60px; opacity: 0.06; }

.results-winner-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--sage), var(--sage2));
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
  box-shadow: 0 6px 20px rgba(74,122,90,0.40);
  flex-shrink: 0;
  opacity: 0;
  animation: res-avatar-bounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both;
}

.results-winner-label  { font-size: 10px; color: var(--sage2); font-weight: 600; letter-spacing: 1px; margin-bottom: 2px; }
.results-winner-name   { font-size: 18px; font-weight: 900; color: var(--paper); }
.results-winner-amount { font-size: 13px; font-weight: 700; color: var(--sage2); opacity: 0; animation: res-fade-up 0.4s ease 0.85s both; }

.results-debts-label { opacity: 0; animation: res-fade-up 0.3s ease 1.55s both; }
.results-players { }
.results-subtitle { font-size: 10px; color: var(--muted); }
.results-debt-card { display: none; } /* replaced by results-debt-row */
.results-debt-avatar { display: none; }
.results-debt-name { }
.results-debt-to { }
.results-debt-amount { }
.results-debts { }
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: `✓ built`.

- [ ] **Step 3: Commit**

```bash
git add src/styles/results.css
git commit -m "feat(design): restyle results screen — amber glow bg, ranked player cards with right border, debt gradient dividers, sage CTA"
```

---

## Task 7: Final verification and push

- [ ] **Step 1: Full build clean check**

```bash
npm run build
```
Expected: `✓ built` with no errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors (warnings about `any` types in existing code are pre-existing and acceptable).

- [ ] **Step 3: Push**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage check:**
- ✅ Auth: logo split, floating suits, surface card, tab toggle, sage inputs
- ✅ Lobby: greeting, 3-col stats grid, history with right border, sage/rust colors
- ✅ Setup: circular stepper, gold pills, player rows with gold index
- ✅ Table: clock header, list layout, ChipStack, amber +קנייה, rust end button, confirm modal
- ✅ EndGame: validation bar transitioning border, stepper controls, gold gradient CTA
- ✅ Results: amber glow, ranked cards, badge, debt gradient dividers, sage play-again
- ✅ Tokens: all new vars in index.css with legacy aliases so existing JSX won't break
- ✅ IBM Plex Mono: added to fonts.css
- ✅ Grain texture: body::after
- ✅ RTL: all screens retain `direction: rtl`
- ✅ No logic changes: all state, routing, data flow untouched

**Placeholder scan:** No TBDs or incomplete sections found.

**Type consistency:** `ChipStack` props `{ buyIns: number, playerIdx: number }` used consistently. `fmtTime(s: number): string` used only in GameTable.tsx. `CHIP_PALETTES` is `string[][]`, indexed correctly.
