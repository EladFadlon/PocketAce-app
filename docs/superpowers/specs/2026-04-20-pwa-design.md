# PocketAce PWA Design

**Date:** 2026-04-20  
**Decision:** Convert PocketAce from a Capacitor native app to a Progressive Web App (PWA)

## Context

PocketAce is a mobile-first poker game manager targeting Hebrew-speaking Israeli poker players. The app was previously set up with Capacitor (iOS + Android), AdMob, and RevenueCat, but native app store publishing is not viable — Apple's $99/year fee plus maintenance overhead exceeds projected revenue.

The primary acquisition channel is Instagram/TikTok ads and WhatsApp sharing, both of which are link-based. Users tap a link and need to install the app. PWA is the natural fit for this flow.

## Goals

- Zero ongoing platform fees
- Install directly from a social ad or WhatsApp link
- App-like home screen experience (no browser chrome, standalone mode)
- Users stay logged in across sessions (no re-auth on every open)
- Fast load, works on slow connections

## Architecture

### 1. PWA Setup — `vite-plugin-pwa`

Add `vite-plugin-pwa` to `vite.config.ts`. At build time it generates:

- **`manifest.json`** with:
  - `name`: "Pocket Ace"
  - `short_name`: "Pocket Ace"
  - `display`: `standalone` (no browser chrome)
  - `dir`: `rtl`
  - `lang`: `he`
  - `theme_color`: `#080810`
  - `background_color`: `#080810`
  - Icons at 192×192, 512×512, and maskable variant

- **Service worker** (Workbox `generateSW` strategy):
  - Precaches all built assets (JS, CSS, HTML, fonts, images)
  - Cache-first for all static assets — app loads instantly from cache on repeat visits
  - No runtime caching needed (no external API calls for game data; all state is in `localStorage`)

### 2. Icons

Generate from a single high-res source (512×512 minimum). Required outputs:
- `icon-192.png` — standard home screen icon
- `icon-512.png` — splash screen / high-res
- `icon-maskable-512.png` — safe-area masked variant for Android adaptive icons

Place in `public/`.

### 3. Auth Persistence

No code changes required. Supabase client already uses `persistSession: true` (default), storing the JWT + refresh token in `localStorage`. `App.tsx` already handles `INITIAL_SESSION` to restore the user on open.

- **Normal use:** open app → straight to LOBBY, no login prompt
- **Token refresh:** Supabase silently renews the access token (1h expiry) using the refresh token (60-day expiry)
- **Re-auth required only:** after 60 days of inactivity, or if user clears browser storage

### 4. Dead Code Removal

Remove Capacitor monetization integrations that are no-ops in a web environment:

- Delete `src/utils/admob.ts`
- Delete `src/utils/purchases.ts`
- Remove their imports and all call sites from `src/App.tsx`
- Uninstall npm packages: `@capacitor-community/admob`, `@revenuecat/purchases-capacitor`
- Keep `@capacitor/core`, `capacitor.config.ts`, and `android/` / `ios/` folders — they don't affect the web build and preserve the option to do a Google Play TWA later

The `isPremium` state in `App.tsx` is kept as a `localStorage` flag — no-op for now, available for future web monetization.

### 5. Hosting — Vercel Free Tier

- Deploy via Vercel (free tier), connected to the GitHub repo
- Every push to `main` triggers an automatic deploy
- HTTPS provided automatically
- URL: `pocketace.vercel.app` (or chosen subdomain)

**Supabase configuration required after deploy:**
In Supabase dashboard → Authentication → URL Configuration:
- Add `https://pocketace.vercel.app` to **Redirect URLs**
- Set **Site URL** to `https://pocketace.vercel.app`

## Install Experience

| Platform | Flow |
|----------|------|
| Android (Chrome) | Browser shows automatic "Add to Home Screen" banner. One tap installs. |
| iOS (Safari) | User taps Share → Add to Home Screen. Two taps. No automatic prompt (iOS limitation). |

For iOS: consider adding a one-time in-app nudge ("מוסיפים לדף הבית לחוויה הכי טובה") that appears on first visit and explains the manual install steps.

## Out of Scope

- Push notifications (iOS PWA limitation)
- AdMob / RevenueCat monetization (Capacitor-native only; revisit if publishing to Google Play via TWA later)
- Google Play TWA submission (valid upgrade path once PWA is live and stable)
