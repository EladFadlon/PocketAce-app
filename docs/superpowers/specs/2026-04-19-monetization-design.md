# Monetization Design — PocketAce

**Date:** 2026-04-19  
**Status:** Approved  
**Decision:** Replace credit system with AdMob ads + one-time premium IAP

---

## Context

PocketAce is a pre-launch mobile poker game manager targeting Israeli casual poker groups (1-2 sessions/week). The original credit system (3 free credits on signup, credits purchased for game sessions) has a fundamental exploit: any player in the group can register a new account and receive free credits, making the paywall bypassable without a backend to enforce it. Moving to App Store / Google Play also triggers mandatory Apple/Google IAP requirements for any purchased virtual currency (30% platform cut, strict review).

---

## Model

**Free tier:** Unlimited games with Google AdMob ads shown in the Lobby screen only.  
**Premium tier:** One-time in-app purchase (~₪4.90) that permanently removes all ads. No additional features — the price point is deliberately below the "worth thinking about" threshold for poker players who regularly stake ₪50–200 per session.

---

## Ad Placement

Ads are shown **only in the Lobby screen**. Never during active game phases (Setup, Table, EndGame, Results) — interrupting a live poker session would damage retention.

- **Banner ad** — fixed at the bottom of the Lobby, always visible for free users
- **Interstitial ad** — full-screen ad shown once per session when the user returns to the Lobby after completing a game (natural session-end moment)

Premium users see no ads; the banner slot disappears cleanly.

---

## Premium IAP

- **Product type:** One-time purchase (non-consumable)
- **Label:** "הסר פרסומות" (Remove Ads)
- **Price:** ~₪4.90 (exact tier set in App Store Connect / Google Play Console)
- **Flow:** User taps a button in Lobby → native App Store / Play Store payment sheet → on success, `isPremium` flag set in app state → ads hidden
- **Restore Purchase:** A "Restore" button (required by Apple) allows users who reinstall or switch devices to reclaim their purchase
- **Backend:** RevenueCat handles receipt validation, restore logic, and cross-platform normalization — no custom server required

---

## Credit System Removal

The entire credit system is removed. This simplifies the codebase and eliminates the exploit.

Items to delete:
- `src/utils/credits.ts`
- Store modal (`store` modal type in `ModalManager`)
- Credit confirmation modal (`creditConfirmation` modal type)
- Welcome gift modal (`welcomeGift` modal type) — remove entirely
- `credits` field on the `User` type in `src/types.ts`
- Credit balance display anywhere in the UI (Lobby, etc.)

---

## Technical Stack Changes

The app is currently a React + Vite web app. To support AdMob and IAP it must be wrapped with **Capacitor**, which packages the existing React code into a native iOS/Android shell with minimal changes to app code.

New dependencies:
- `@capacitor/core`, `@capacitor/ios`, `@capacitor/android` — native shell
- `@capacitor-community/admob` — Google AdMob integration
- RevenueCat's Capacitor SDK (`@revenuecat/purchases-capacitor`) — IAP + restore

App state additions:
- `isPremium: boolean` — controls ad visibility throughout the app; initialized from RevenueCat on app start

Everything else (game logic, settlements, Firebase auth, design system, Hebrew UI) is unchanged.

---

## What Stays the Same

- All game logic and phase-based navigation
- Settlement calculation and WhatsApp share
- Firebase phone authentication
- Entire design system and Hebrew RTL UI
- localStorage persistence for game/user data
