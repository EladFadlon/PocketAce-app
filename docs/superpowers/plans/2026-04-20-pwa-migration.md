# PocketAce PWA Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert PocketAce from a Capacitor native app to a PWA — installable from a link, runs in standalone mode, no app store required.

**Architecture:** Add `vite-plugin-pwa` to generate a `manifest.json` and Workbox service worker at build time. Remove dead Capacitor monetization code. Add an iOS install nudge component. Deploy to Vercel and configure Supabase redirect URLs.

**Tech Stack:** Vite 8, React 19, TypeScript, `vite-plugin-pwa`, `@vite-pwa/assets-generator`, Supabase, Vercel

---

## File Map

**Modified:**
- `vite.config.ts` — add VitePWA plugin with manifest + workbox config
- `index.html` — add `theme-color` meta tag and `apple-touch-icon` link
- `src/App.tsx` — remove admob/purchases imports and call sites; render `<InstallPrompt />`
- `package.json` — handled via npm commands (no manual edits)

**Created:**
- `pwa-assets.config.ts` — icon generation config (dev-time only, committed)
- `src/components/InstallPrompt.tsx` — iOS "Add to Home Screen" nudge
- `src/styles/install-prompt.css` — styles for the nudge

**Deleted:**
- `src/utils/admob.ts`
- `src/utils/purchases.ts`

**Generated + committed:**
- `public/pwa-64x64.png`
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/maskable-icon-512x512.png`
- `public/apple-touch-icon-180x180.png`

---

## Task 1: Remove Dead Capacitor Code

**Files:**
- Delete: `src/utils/admob.ts`
- Delete: `src/utils/purchases.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Delete the admob and purchases utility files**

```bash
rm "src/utils/admob.ts" "src/utils/purchases.ts"
```

- [ ] **Step 2: Uninstall the Capacitor monetization packages**

```bash
npm uninstall @capacitor-community/admob @revenuecat/purchases-capacitor
```

- [ ] **Step 3: Remove dead imports and call sites from `src/App.tsx`**

Replace the full import block at the top of `src/App.tsx`. Remove lines 14–15:

```tsx
// REMOVE these two lines:
import { initializeAdMob, showBannerAd, removeBannerAd, showInterstitialAd } from './utils/admob';
import { initializePurchases, checkPremiumStatus } from './utils/purchases';
```

Remove the `initializePurchases` + `checkPremiumStatus` call block inside the `handleSession` function (lines 43–49):

```tsx
// REMOVE this block inside handleSession:
initializePurchases(user.id).then(() => {
  checkPremiumStatus().then(premium => {
    if (premium && mounted) {
      setIsPremium(true);
      localStorage.setItem('pocketAce_isPremium', 'true');
    }
  });
});
```

Remove the `initializeAdMob` effect (lines 94–96):

```tsx
// REMOVE this entire useEffect:
useEffect(() => {
  initializeAdMob();
}, []);
```

Remove the banner ad effect (lines 98–104):

```tsx
// REMOVE this entire useEffect:
useEffect(() => {
  if (phase === GamePhaseEnum.LOBBY && !isPremium) {
    showBannerAd();
  } else {
    removeBannerAd();
  }
}, [phase, isPremium]);
```

Remove the `showInterstitialAd` call inside `resetToLobby` (lines 170–173):

```tsx
// REMOVE these lines inside resetToLobby:
if (gameJustEnded.current && !isPremium) {
  gameJustEnded.current = false;
  await showInterstitialAd();
}
```

Also remove the `gameJustEnded` ref declaration (line 29) and the `gameJustEnded.current = true` assignment inside `handleCalculateSettlements` (line 165):

```tsx
// REMOVE this line:
const gameJustEnded = useRef(false);

// REMOVE this line inside handleCalculateSettlements:
gameJustEnded.current = true;
```

Remove the `useRef` import since it's no longer needed — change line 1:

```tsx
// BEFORE:
import { useState, useCallback, useEffect, useRef } from 'react';

// AFTER:
import { useState, useCallback, useEffect } from 'react';
```

- [ ] **Step 4: Verify the build passes**

```bash
npm run build
```

Expected: no TypeScript errors, no missing module errors. The `dist/` folder is produced.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove admob and revenuecat dead code"
```

---

## Task 2: Add vite-plugin-pwa

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Install vite-plugin-pwa**

```bash
npm install -D vite-plugin-pwa
```

- [ ] **Step 2: Replace `vite.config.ts` entirely**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png', 'pwa-64x64.png'],
      manifest: {
        name: 'Pocket Ace',
        short_name: 'Pocket Ace',
        description: 'מנהל משחק פוקר',
        theme_color: '#080810',
        background_color: '#080810',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'he',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
    }),
  ],
})
```

- [ ] **Step 3: Add `theme-color` meta and `apple-touch-icon` link to `index.html`**

Replace the existing `<head>` content in `index.html`:

```html
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#080810" />
    <meta name="description" content="Pocket Ace - מנהל משחק ופקיד הקופה לפוקר" />
    <title>Pocket Ace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Verify the build produces the manifest and service worker**

```bash
npm run build
```

Expected output includes lines like:
```
PWA v1.0.x
mode      generateSW
precache  N entries
```

Check that `dist/manifest.webmanifest` exists and `dist/sw.js` exists:

```bash
ls dist/manifest.webmanifest dist/sw.js
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add vite-plugin-pwa with manifest and service worker"
```

---

## Task 3: Generate PWA Icons

**Files:**
- Create: `pwa-assets.config.ts`
- Generate + commit: `public/pwa-64x64.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`

- [ ] **Step 1: Install the assets generator**

```bash
npm install -D @vite-pwa/assets-generator
```

- [ ] **Step 2: Create `pwa-assets.config.ts` in the project root**

```ts
import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: minimalPreset,
  images: ['public/favicon.svg'],
})
```

- [ ] **Step 3: Run the icon generator**

```bash
npx pwa-assets-generator --config pwa-assets.config.ts
```

Expected: 5 PNG files created in `public/`:
```
public/pwa-64x64.png
public/pwa-192x192.png
public/pwa-512x512.png
public/maskable-icon-512x512.png
public/apple-touch-icon-180x180.png
```

- [ ] **Step 4: Verify the build still passes**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 5: Commit**

```bash
git add public/pwa-64x64.png public/pwa-192x192.png public/pwa-512x512.png public/maskable-icon-512x512.png public/apple-touch-icon-180x180.png pwa-assets.config.ts
git commit -m "feat: add PWA icons generated from favicon"
```

---

## Task 4: iOS Install Nudge

**Files:**
- Create: `src/components/InstallPrompt.tsx`
- Create: `src/styles/install-prompt.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/styles/install-prompt.css`**

```css
.install-prompt {
  position: fixed;
  bottom: 24px;
  left: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-lg);
  padding: 14px 16px 14px 44px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  z-index: 999;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.install-prompt__close {
  position: absolute;
  top: 10px;
  left: 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 6px;
  min-width: var(--touch);
  min-height: var(--touch);
  display: flex;
  align-items: center;
  justify-content: center;
}

.install-prompt__share {
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin: 0 2px;
}
```

- [ ] **Step 2: Create `src/components/InstallPrompt.tsx`**

```tsx
import { useState, useEffect } from 'react';
import '../styles/install-prompt.css';

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  'standalone' in navigator && (navigator as Navigator & { standalone: boolean }).standalone;

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pocketAce_installDismissed');
    if (isIos() && !isStandalone() && !dismissed) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('pocketAce_installDismissed', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="install-prompt">
      <button className="install-prompt__close" onClick={dismiss} aria-label="סגור">
        ✕
      </button>
      להתקנה: לחץ{' '}
      <svg className="install-prompt__share" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>{' '}
      ואז "הוסף למסך הבית"
    </div>
  );
}
```

- [ ] **Step 3: Add `InstallPrompt` to `src/App.tsx`**

Add the import after the other component imports:

```tsx
import { InstallPrompt } from './components/InstallPrompt';
```

Add the component inside the return JSX, as the last child of `<div className="app">`:

```tsx
return (
  <div className="app">
    {/* ...existing phase renders... */}
    <InstallPrompt />
  </div>
);
```

- [ ] **Step 4: Verify the build passes**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/InstallPrompt.tsx src/styles/install-prompt.css src/App.tsx
git commit -m "feat: add iOS install nudge component"
```

---

## Task 5: Deploy to Vercel and Configure Supabase

This task is manual (no code changes).

- [ ] **Step 1: Push all commits to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Create a Vercel project**

1. Go to vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import the `PocketAce` repository
4. Framework Preset: **Vite** (auto-detected)
5. Add environment variables from your `.env.local`:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
6. Click **Deploy**
7. Note the assigned URL (e.g. `pocketace.vercel.app`)

- [ ] **Step 3: Configure Supabase redirect URLs**

In the Supabase dashboard for your project:
1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `https://pocketace.vercel.app` (use your actual URL)
3. Under **Redirect URLs**, add `https://pocketace.vercel.app/**`
4. Save

- [ ] **Step 4: Verify the deployed app**

Open `https://pocketace.vercel.app` in Chrome on Android:
- The browser should show an "Add to Home Screen" install banner
- Tap it, install, open from home screen — app should launch with no browser chrome

Open on iOS Safari:
- Tap Share → Add to Home Screen
- Open from home screen — app should launch standalone
- On first open in Safari (before adding to home screen), the install nudge should appear at the bottom

- [ ] **Step 5: Run a Lighthouse PWA audit (optional but recommended)**

In Chrome DevTools on the deployed URL:
1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App" category
3. Run audit
4. Expected: green PWA badge, all installability checks pass
