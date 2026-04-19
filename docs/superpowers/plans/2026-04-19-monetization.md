# Monetization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the credit system with AdMob ads (free tier) and a ₪7.90 one-time IAP to remove ads (premium tier), using Capacitor to wrap the app for App Store / Google Play.

**Architecture:** Credits are stripped from the data model and all UI. Capacitor wraps the existing React app as a native shell. AdMob shows a banner + interstitial in the Lobby; RevenueCat handles the IAP and receipt validation. A single `isPremium` boolean in App state gates all ads.

**Tech Stack:** Capacitor 6, @capacitor-community/admob, @revenuecat/purchases-capacitor, React 19, TypeScript, Vite

---

## Prerequisites (external — not code tasks)

Before running Tasks 3–4, the following accounts and IDs must exist:
- **Google AdMob account** → create a new app → get a Banner Ad Unit ID and an Interstitial Ad Unit ID for each platform (iOS + Android). Until then, use the Google test IDs already in the code.
- **RevenueCat account** → create a project → get iOS and Android API keys → create a non-consumable product called `remove_ads` at ₪7.90 in App Store Connect and Google Play Console, linked to an entitlement named `premium`.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/types.ts` | Modify | Remove `credits` from `User` |
| `src/utils/auth.ts` | Modify | Remove credit constants and functions |
| `src/utils/credits.ts` | Delete | Entire file no longer needed |
| `src/components/modals/WelcomeGiftModal.tsx` | Delete | Credit modal |
| `src/components/modals/CreditConfirmationModal.tsx` | Delete | Credit modal |
| `src/components/modals/StoreModal.tsx` | Delete | Credit modal |
| `src/components/modals/GameOverModal.tsx` | Delete | Credit modal |
| `src/components/modals/ModalManager.tsx` | Delete | No modals remain |
| `src/components/modals/index.ts` | Delete | No modals remain |
| `src/components/modals/modals.css` | Delete | No modals remain |
| `src/App.tsx` | Modify | Remove all credit logic, add `isPremium` state, init AdMob + RevenueCat, trigger interstitial on return from game |
| `src/components/Lobby.tsx` | Modify | Remove credits pill + store teaser, add premium button + restore button, conditionally render banner slot |
| `src/styles/lobby.css` | Modify | Add `.lobby-premium-btn` and `.lobby-ad-banner` styles |
| `src/utils/admob.ts` | Create | AdMob init, show/hide banner, show interstitial |
| `src/utils/purchases.ts` | Create | RevenueCat init, check premium, purchase, restore |
| `capacitor.config.ts` | Create | Capacitor app configuration |
| `package.json` | Modify | New Capacitor + AdMob + RevenueCat dependencies |

---

## Task 1: Remove the credit system from types and auth

**Files:**
- Modify: `src/types.ts`
- Modify: `src/utils/auth.ts`
- Delete: `src/utils/credits.ts`

- [ ] **Step 1: Update the User type — remove credits field**

Replace the `User` interface in `src/types.ts`:

```typescript
export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
}
```

- [ ] **Step 2: Strip credit functions from auth.ts**

In `src/utils/auth.ts`, make these changes:

Remove the constant on line 10:
```typescript
// DELETE THIS LINE:
const INITIAL_CREDITS = 3;
```

In `verifyCodeAndRegister`, find the new user creation block and remove `credits`:
```typescript
const newUser: User = {
  id: userId,
  name: name,
  phone: phone,
  createdAt: Date.now()
};
```

Delete the entire `updateUserCredits` function (lines 342–354) and the entire `decrementCredits` function (lines 356–368).

- [ ] **Step 3: Delete credits.ts**

```bash
rm "/Users/macbookpro/Desktop/PocketAce app/src/utils/credits.ts"
```

- [ ] **Step 4: Build to confirm no TypeScript errors so far**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm run build 2>&1 | head -40
```

Expected: build errors referencing `credits`, `updateUserCredits`, `grantWelcomeGift` — these are resolved in Task 2. If there are *other* unexpected errors, fix them before continuing.

---

## Task 2: Remove credit logic from App.tsx and Lobby.tsx, delete modal files

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Lobby.tsx`
- Delete: `src/components/modals/` (entire directory)

- [ ] **Step 1: Replace App.tsx with credit-free version**

Write the full content of `src/App.tsx`:

```typescript
import { useState, useCallback, useEffect } from 'react';
import type { GamePhase, GameSettings, Player, PlayerSettlement, Debt, User } from './types';
import { GamePhase as GamePhaseEnum } from './types';
import { Auth } from './components/Auth';
import { Lobby } from './components/Lobby';
import { GameSetup } from './components/GameSetup';
import { GameTable } from './components/GameTable';
import { EndGame } from './components/EndGame';
import { SettlementResults } from './components/SettlementResults';
import { calculatePlayerSettlements, minimizeDebts } from './utils/settlements';
import { getCurrentUser, logoutUser } from './utils/auth';
import { saveGameRecord } from './utils/gameHistory';
import './App.css';

const GAME_SAVE_KEY = 'pocketAce_currentGame';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<GamePhase>(GamePhaseEnum.AUTH);
  const [settings, setSettings] = useState<GameSettings>({ nisPerBuyIn: 50, chipsPerBuyIn: 100 });
  const [players, setPlayers] = useState<Player[]>([]);
  const [settlements, setSettlements] = useState<PlayerSettlement[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [hostFee, setHostFee] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setCurrentUser(user);

    try {
      const saved = localStorage.getItem(GAME_SAVE_KEY);
      if (saved) {
        const { phase: savedPhase, players: savedPlayers, settings: savedSettings } = JSON.parse(saved);
        if (savedPlayers?.length > 0) {
          setPlayers(savedPlayers);
          setSettings(savedSettings);
          setPhase(savedPhase);
          return;
        }
      }
    } catch { /* fall through to lobby */ }

    setPhase(GamePhaseEnum.LOBBY);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === GamePhaseEnum.TABLE || phase === GamePhaseEnum.END_GAME) {
      localStorage.setItem(GAME_SAVE_KEY, JSON.stringify({ phase, players, settings }));
    } else if ([GamePhaseEnum.LOBBY, GamePhaseEnum.RESULTS, GamePhaseEnum.AUTH].includes(phase as any)) {
      localStorage.removeItem(GAME_SAVE_KEY);
    }
  }, [phase, players, settings]);

  const handleAuthSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setPhase(GamePhaseEnum.LOBBY);
  }, []);

  const handleLogout = useCallback(() => {
    logoutUser();
    localStorage.removeItem(GAME_SAVE_KEY);
    setCurrentUser(null);
    setPhase(GamePhaseEnum.AUTH);
  }, []);

  const handleStartFromLobby = useCallback(() => {
    if (!currentUser) return;
    const hostPlayer: Player = {
      id: `host_${currentUser.id}`,
      name: currentUser.name,
      buyIns: 1,
      totalInvested: settings.nisPerBuyIn,
      finalChips: settings.chipsPerBuyIn,
      isHost: true,
    };
    setPlayers([hostPlayer]);
    setSettlements([]);
    setDebts([]);
    setHostFee(0);
    setPhase(GamePhaseEnum.SETUP);
  }, [currentUser, settings]);

  const handleStartGame = useCallback((newSettings: GameSettings, newPlayers: Player[]) => {
    setSettings(newSettings);
    setPlayers(newPlayers);
    setPhase(GamePhaseEnum.TABLE);
  }, []);

  const handleAddBuyIn = useCallback((playerId: string) => {
    setPlayers(prev =>
      prev.map(p =>
        p.id === playerId
          ? { ...p, buyIns: p.buyIns + 1, totalInvested: (p.buyIns + 1) * settings.nisPerBuyIn }
          : p
      )
    );
  }, [settings]);

  const handleEndGame = useCallback(() => setPhase(GamePhaseEnum.END_GAME), []);
  const handleBackFromEndGame = useCallback(() => setPhase(GamePhaseEnum.TABLE), []);

  const handleCalculateSettlements = useCallback((finalChips: Record<string, number>) => {
    const updatedPlayers = players.map(p => ({ ...p, finalChips: finalChips[p.id] || 0 }));
    const { settlements: ps, hostFee: fee } = calculatePlayerSettlements(updatedPlayers, settings);
    const calculatedDebts = minimizeDebts(ps);

    setSettlements(ps);
    setDebts(calculatedDebts);
    setHostFee(fee);

    if (currentUser) {
      const host = updatedPlayers.find(p => p.isHost);
      saveGameRecord(currentUser.id, host?.name || currentUser.name, ps, calculatedDebts);
    }

    setPhase(GamePhaseEnum.RESULTS);
  }, [players, settings, currentUser]);

  const resetToLobby = useCallback(() => {
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
    setSettlements([]);
    setDebts([]);
    setHostFee(0);
  }, []);

  const handleQuit = useCallback(() => {
    localStorage.removeItem(GAME_SAVE_KEY);
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
  }, []);

  return (
    <div className="app">
      {phase === GamePhaseEnum.AUTH && (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}

      {phase === GamePhaseEnum.LOBBY && currentUser && (
        <Lobby
          onStartGame={handleStartFromLobby}
          user={currentUser}
          onLogout={handleLogout}
          isPremium={isPremium}
          onPremiumChange={setIsPremium}
        />
      )}

      {phase === GamePhaseEnum.SETUP && currentUser && (
        <GameSetup onStartGame={handleStartGame} onHome={resetToLobby} existingPlayers={players} />
      )}

      {phase === GamePhaseEnum.TABLE && (
        <GameTable
          players={players}
          settings={settings}
          onAddBuyIn={handleAddBuyIn}
          onEndGame={handleEndGame}
          onQuit={handleQuit}
          onHome={resetToLobby}
        />
      )}

      {phase === GamePhaseEnum.END_GAME && (
        <EndGame
          players={players}
          settings={settings}
          onCalculate={handleCalculateSettlements}
          onBack={handleBackFromEndGame}
          onHome={resetToLobby}
        />
      )}

      {phase === GamePhaseEnum.RESULTS && currentUser && (
        <SettlementResults
          settlements={settlements}
          debts={debts}
          gameSettings={settings}
          hostFee={hostFee}
          onPlayAgain={resetToLobby}
          onHome={resetToLobby}
          user={currentUser}
        />
      )}
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Delete all modal files**

```bash
rm -rf "/Users/macbookpro/Desktop/PocketAce app/src/components/modals"
```

- [ ] **Step 3: Update Lobby.tsx — remove credits, add premium + restore buttons**

Write the full content of `src/components/Lobby.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, GameRecord } from '../types';
import { getRecentGames, calculateCumulativeProfitLoss, getCumulativeStatus } from '../utils/gameHistory';
import '../styles/lobby.css';

interface LobbyProps {
  onStartGame: () => void;
  user: User;
  onLogout: () => void;
  isPremium: boolean;
  onPremiumChange: (value: boolean) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartGame, user, onLogout, isPremium, onPremiumChange }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [recentGames, setRecentGames] = useState<GameRecord[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);
  const [status, setStatus] = useState({ badge: '', message: '' });

  useEffect(() => {
    const hasVisited = localStorage.getItem('pocketAceVisited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('pocketAceVisited', 'true');
    }
    const games = getRecentGames(user.id, 3);
    setRecentGames(games);
    const cumulative = calculateCumulativeProfitLoss(user.id, user.name);
    setStatus(getCumulativeStatus(cumulative));
  }, [user.id, user.name]);

  const firstName = user.name.split(' ')[0];
  const firstLetter = firstName.charAt(0);

  const CREW_COLORS = ['linear-gradient(135deg,#e74c3c,#c0392b)', 'linear-gradient(135deg,#3498db,#2980b9)', 'linear-gradient(135deg,#2ecc71,#27ae60)'];
  const CREW_SHADOWS = ['rgba(231,76,60,0.4)', 'rgba(52,152,219,0.4)', 'rgba(46,204,113,0.4)'];
  const CREW_EMOJIS = ['🤙', '😎', '🦈'];

  const handlePurchase = async () => {
    const { purchaseRemoveAds } = await import('../utils/purchases');
    const success = await purchaseRemoveAds();
    if (success) onPremiumChange(true);
  };

  const handleRestore = async () => {
    const { restorePurchases } = await import('../utils/purchases');
    const wasPremium = await restorePurchases();
    if (wasPremium) onPremiumChange(true);
  };

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
                <div className="lobby-stat-label">סה&quot;כ רווח</div>
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
                    <div className="lobby-history-sub">{game.debts.length} חובות</div>
                  </div>
                  <div className={`lobby-history-amount ${amount >= 0 ? 'win' : 'loss'}`}>
                    {game.topShark ? `🦈 +${game.topShark.amount.toFixed(0)}₪` : `${amount >= 0 ? '+' : ''}${amount.toFixed(0)}₪`}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Premium / Remove Ads */}
        {!isPremium && (
          <div className="lobby-premium-section">
            <motion.button
              className="lobby-premium-btn"
              onClick={handlePurchase}
              whileTap={{ scale: 0.97 }}
            >
              בלי פרסומות. רק פוקר. ♠
            </motion.button>
            <button className="lobby-restore-btn" onClick={handleRestore}>
              שחזר רכישה
            </button>
          </div>
        )}
      </div>

      {/* Ad banner placeholder — AdMob injects the real banner via native overlay */}
      {!isPremium && <div className="lobby-ad-banner" />}

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
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>נהל את משחקי הפוקר שלך בקלות. מי חייב למי — ב-10 שניות. 🃏</p>
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
};
```

- [ ] **Step 4: Add premium + ad banner styles to lobby.css**

Append to `src/styles/lobby.css`:

```css
/* Premium / Remove Ads */
.lobby-premium-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 20px 8px;
}

.lobby-premium-btn {
  width: 100%;
  background: rgba(245, 197, 24, 0.08);
  border: 1px solid rgba(245, 197, 24, 0.25);
  color: var(--yellow);
  padding: 14px 20px;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.2px;
}

.lobby-restore-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  text-decoration: underline;
}

/* Space reserved at the bottom for the AdMob native banner overlay */
.lobby-ad-banner {
  height: 60px;
  flex-shrink: 0;
}
```

- [ ] **Step 5: Build to confirm clean compile**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm run build 2>&1 | tail -20
```

Expected: `✓ built in` with no TypeScript errors. If there are import errors referencing deleted files, fix them before continuing.

- [ ] **Step 6: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && git add -A && git commit -m "feat: remove credit system — unlimited games, add premium UI shell"
```

---

## Task 3: Capacitor setup

**Files:**
- Create: `capacitor.config.ts`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install Capacitor core and CLI**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm install @capacitor/core && npm install -D @capacitor/cli
```

Expected: packages installed with no peer dependency errors.

- [ ] **Step 2: Create capacitor.config.ts**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pocketace.app',
  appName: 'Pocket Ace',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

- [ ] **Step 3: Add iOS and Android platforms**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm install @capacitor/ios @capacitor/android
```

- [ ] **Step 4: Build the web app and initialize native platforms**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm run build && npx cap add ios && npx cap add android
```

Expected: `ios/` and `android/` directories created. If `npx cap add ios` fails due to missing Xcode, note it and continue — the Android platform can still be added and the iOS platform added later when Xcode is available.

- [ ] **Step 5: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && git add -A && git commit -m "feat: add Capacitor native shell for iOS and Android"
```

---

## Task 4: AdMob integration

**Files:**
- Create: `src/utils/admob.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install AdMob plugin**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm install @capacitor-community/admob && npx cap sync
```

- [ ] **Step 2: Create src/utils/admob.ts**

```typescript
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import type { AdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Google's official test ad unit IDs — replace with real IDs from AdMob console before release
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';
const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';

// Replace these with real IDs from AdMob console after creating the app there
export const PROD_BANNER_IOS = 'ca-app-pub-REPLACE_ME/REPLACE_ME';
export const PROD_BANNER_ANDROID = 'ca-app-pub-REPLACE_ME/REPLACE_ME';
export const PROD_INTERSTITIAL_IOS = 'ca-app-pub-REPLACE_ME/REPLACE_ME';
export const PROD_INTERSTITIAL_ANDROID = 'ca-app-pub-REPLACE_ME/REPLACE_ME';

const isIos = () => Capacitor.getPlatform() === 'ios';
const isNative = () => Capacitor.isNativePlatform();

export const initializeAdMob = async (): Promise<void> => {
  if (!isNative()) return;
  await AdMob.initialize({ requestTrackingAuthorization: true });
};

export const showBannerAd = async (): Promise<void> => {
  if (!isNative()) return;
  const options: BannerAdOptions = {
    adId: isIos() ? TEST_BANNER_IOS : TEST_BANNER_ANDROID,
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: true,
  };
  await AdMob.showBanner(options);
};

export const hideBannerAd = async (): Promise<void> => {
  if (!isNative()) return;
  await AdMob.hideBanner();
};

export const removeBannerAd = async (): Promise<void> => {
  if (!isNative()) return;
  await AdMob.removeBanner();
};

export const showInterstitialAd = async (): Promise<void> => {
  if (!isNative()) return;
  const options: AdOptions = {
    adId: isIos() ? TEST_INTERSTITIAL_IOS : TEST_INTERSTITIAL_ANDROID,
    isTesting: true,
  };
  await AdMob.prepareInterstitial(options);
  await AdMob.showInterstitial();
};
```

- [ ] **Step 3: Wire AdMob into App.tsx**

First, update the React import line at the top of `src/App.tsx` to include `useRef`:

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
```

Add the AdMob import after existing imports:

```typescript
import { initializeAdMob, showBannerAd, removeBannerAd, showInterstitialAd } from './utils/admob';
```

Add `gameJustEnded` ref to track when to show interstitial. Inside the `App` function, after the existing state declarations:

```typescript
const gameJustEnded = useRef(false);
```

Replace the `resetToLobby` callback with this version that triggers the interstitial:

```typescript
const resetToLobby = useCallback(async () => {
  if (gameJustEnded.current && !isPremium) {
    gameJustEnded.current = false;
    await showInterstitialAd();
  }
  setPhase(GamePhaseEnum.LOBBY);
  setPlayers([]);
  setSettlements([]);
  setDebts([]);
  setHostFee(0);
}, [isPremium]);
```

In `handleCalculateSettlements`, find the last two lines and replace them to set the flag before changing phase:

```typescript
    // replace this:
    setPhase(GamePhaseEnum.RESULTS);

    // with this:
    gameJustEnded.current = true;
    setPhase(GamePhaseEnum.RESULTS);
```

Add a `useEffect` to init AdMob on mount and show/hide the banner when `isPremium` or `phase` changes:

```typescript
useEffect(() => {
  initializeAdMob();
}, []);

useEffect(() => {
  if (phase === GamePhaseEnum.LOBBY && !isPremium) {
    showBannerAd();
  } else {
    removeBannerAd();
  }
}, [phase, isPremium]);
```

- [ ] **Step 4: Build to confirm no TypeScript errors**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm run build 2>&1 | tail -20
```

Expected: clean build.

- [ ] **Step 5: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && git add -A && git commit -m "feat: integrate AdMob — banner in Lobby, interstitial on game end"
```

---

## Task 5: RevenueCat + Premium IAP

**Files:**
- Create: `src/utils/purchases.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install RevenueCat plugin**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm install @revenuecat/purchases-capacitor && npx cap sync
```

- [ ] **Step 2: Create src/utils/purchases.ts**

```typescript
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// Replace with real API keys from your RevenueCat dashboard
export const REVENUECAT_API_KEY_IOS = 'appl_REPLACE_ME';
export const REVENUECAT_API_KEY_ANDROID = 'goog_REPLACE_ME';

const PREMIUM_ENTITLEMENT_ID = 'premium';

const isIos = () => Capacitor.getPlatform() === 'ios';
const isNative = () => Capacitor.isNativePlatform();

export const initializePurchases = async (userId: string): Promise<void> => {
  if (!isNative()) return;
  const apiKey = isIos() ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  await Purchases.configure({ apiKey, appUserID: userId });
  if (import.meta.env.DEV) {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  }
};

export const checkPremiumStatus = async (): Promise<boolean> => {
  if (!isNative()) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
};

export const purchaseRemoveAds = async (): Promise<boolean> => {
  if (!isNative()) return false;
  try {
    const { offerings } = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  if (!isNative()) return false;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
};
```

- [ ] **Step 3: Initialize RevenueCat and load premium status in App.tsx**

Add import at the top of `src/App.tsx`:

```typescript
import { initializePurchases, checkPremiumStatus } from './utils/purchases';
```

Update the existing `useEffect` that runs on mount (the one that calls `getCurrentUser()`) to also init RevenueCat and check premium status:

```typescript
useEffect(() => {
  const user = getCurrentUser();
  if (!user) return;
  setCurrentUser(user);

  initializePurchases(user.id).then(() => {
    checkPremiumStatus().then(premium => {
      if (premium) setIsPremium(true);
    });
  });

  try {
    const saved = localStorage.getItem(GAME_SAVE_KEY);
    if (saved) {
      const { phase: savedPhase, players: savedPlayers, settings: savedSettings } = JSON.parse(saved);
      if (savedPlayers?.length > 0) {
        setPlayers(savedPlayers);
        setSettings(savedSettings);
        setPhase(savedPhase);
        return;
      }
    }
  } catch { /* fall through to lobby */ }

  setPhase(GamePhaseEnum.LOBBY);
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Build to confirm clean compile**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npm run build 2>&1 | tail -20
```

Expected: clean build with no TypeScript errors.

- [ ] **Step 5: Sync native projects**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && npx cap sync
```

- [ ] **Step 6: Commit**

```bash
cd "/Users/macbookpro/Desktop/PocketAce app" && git add -A && git commit -m "feat: integrate RevenueCat — premium IAP removes ads at ₪7.90"
```

---

## After the Code — External Setup Checklist

These steps happen outside the codebase, in dashboards. They're required before the app can go live:

1. **AdMob console** — create app → create Banner and Interstitial ad units → replace the `PROD_*` placeholders in `src/utils/admob.ts` → set `isTesting: false`
2. **RevenueCat dashboard** — create project → add iOS and Android apps → paste real API keys into `src/utils/purchases.ts` replacing `REPLACE_ME`
3. **App Store Connect** — create `remove_ads` non-consumable IAP at the ₪7.90 tier → link to RevenueCat
4. **Google Play Console** — create the same product → link to RevenueCat
5. **AdMob app IDs** — add `GADApplicationIdentifier` to `ios/App/App/Info.plist` and `com.google.android.gms.ads.APPLICATION_ID` to `android/app/src/main/AndroidManifest.xml` (AdMob requires this or the app crashes on launch)
