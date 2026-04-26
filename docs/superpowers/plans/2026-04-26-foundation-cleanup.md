# Foundation Cleanup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all lint errors, dead code, duplicated constants, and scattered localStorage access with zero user-facing behavior changes.

**Architecture:** New `storage.ts` owns every localStorage key and all parse/serialize logic. New `playerColors.ts` owns player palette constants used across three components. Domain utils delegate their I/O to `storage.ts`. Components use lazy state initialization instead of init `useEffect` hooks.

**Tech Stack:** React 19, TypeScript strict, Vite, ESLint (react-hooks plugin)

---

## File Map

| File | Action |
|------|--------|
| `src/types.ts` | Add `SavedGame` interface |
| `src/utils/storage.ts` | **Create** — typed localStorage layer |
| `src/utils/playerColors.ts` | **Create** — shared player palette + emoji constants |
| `src/utils/auth.ts` | Update — delegate I/O to `storage` |
| `src/utils/regulars.ts` | Update — delegate I/O to `storage` |
| `src/utils/gameHistory.ts` | Update — delegate I/O to `storage` |
| `src/App.tsx` | Update — lazy init, fix deps, use `storage` |
| `src/components/GameSetup.tsx` | Update — lazy player init, Toast, import order |
| `src/components/EndGame.tsx` | Update — remove dead prop, import order, use `playerColors` |
| `src/components/SettlementResults.tsx` | Update — use `playerColors` |
| `src/components/Lobby.tsx` | Update — use `storage` for visited key |
| `CLAUDE.md` | Update — fix stale design token reference |

---

### Task 1: Add `SavedGame` to `src/types.ts`

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Add the `SavedGame` interface**

Open `src/types.ts` and append after the `GameState` interface at the bottom:

```ts
export interface SavedGame {
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  gameStartedAt: number | null;
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add SavedGame interface to types"
```

---

### Task 2: Create `src/utils/storage.ts`

**Files:**
- Create: `src/utils/storage.ts`

- [ ] **Step 1: Create the file**

```ts
import type { User, GameRecord, SavedGame } from '../types';

const KEYS = {
  USER:         'pocketAce_user',
  CURRENT_GAME: 'pocketAce_currentGame',
  REGULARS:     'pocketAce_regulars',
  IS_PREMIUM:   'pocketAce_isPremium',
  VISITED:      'pocketAceVisited',
  gameHistory:  (userId: string) => `pocketAce_gameHistory_${userId}`,
} as const;

const parse = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const storage = {
  // ── User session ───────────────────────────────────────
  getUser():          User | null { return parse<User | null>(KEYS.USER, null); },
  setUser(u: User):   void        { write(KEYS.USER, u); },
  clearUser():        void        { localStorage.removeItem(KEYS.USER); },

  // ── In-progress game ───────────────────────────────────
  getCurrentGame():              SavedGame | null { return parse<SavedGame | null>(KEYS.CURRENT_GAME, null); },
  setCurrentGame(g: SavedGame):  void             { write(KEYS.CURRENT_GAME, g); },
  clearCurrentGame():            void             { localStorage.removeItem(KEYS.CURRENT_GAME); },

  // ── Regulars roster ────────────────────────────────────
  getRegulars():              string[] { return parse<string[]>(KEYS.REGULARS, []); },
  setRegulars(n: string[]):   void     { write(KEYS.REGULARS, n); },

  // ── Premium flag ───────────────────────────────────────
  getIsPremium(): boolean { return localStorage.getItem(KEYS.IS_PREMIUM) === 'true'; },
  setIsPremium(val: boolean): void {
    if (val) localStorage.setItem(KEYS.IS_PREMIUM, 'true');
    else     localStorage.removeItem(KEYS.IS_PREMIUM);
  },

  // ── First-visit flag ───────────────────────────────────
  getVisited():  boolean { return localStorage.getItem(KEYS.VISITED) === 'true'; },
  setVisited():  void    { localStorage.setItem(KEYS.VISITED, 'true'); },

  // ── Game history (per user) ────────────────────────────
  getGameHistory(userId: string):                    GameRecord[] { return parse<GameRecord[]>(KEYS.gameHistory(userId), []); },
  setGameHistory(userId: string, r: GameRecord[]):   void         { write(KEYS.gameHistory(userId), r); },
  clearGameHistory(userId: string):                  void         { localStorage.removeItem(KEYS.gameHistory(userId)); },
};
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/utils/storage.ts
git commit -m "feat: add typed storage layer — centralise all localStorage keys"
```

---

### Task 3: Create `src/utils/playerColors.ts`

**Files:**
- Create: `src/utils/playerColors.ts`

- [ ] **Step 1: Create the file**

```ts
export const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'] as const;

export const PLAYER_PALETTES = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', cardBg: 'linear-gradient(145deg,rgba(231,76,60,0.15),rgba(231,76,60,0.05))', border: 'rgba(231,76,60,0.35)', glow: 'rgba(231,76,60,0.45)', text: '#e74c3c' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)', cardBg: 'linear-gradient(145deg,rgba(52,152,219,0.15),rgba(52,152,219,0.05))',  border: 'rgba(52,152,219,0.35)',  glow: 'rgba(52,152,219,0.45)',  text: '#3498db' },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', cardBg: 'linear-gradient(145deg,rgba(46,204,113,0.15),rgba(46,204,113,0.05))',  border: 'rgba(46,204,113,0.35)',  glow: 'rgba(46,204,113,0.45)',  text: '#2ecc71' },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)', cardBg: 'linear-gradient(145deg,rgba(155,89,182,0.15),rgba(155,89,182,0.05))',  border: 'rgba(155,89,182,0.35)',  glow: 'rgba(155,89,182,0.45)',  text: '#9b59b6' },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)', cardBg: 'linear-gradient(145deg,rgba(255,107,53,0.15),rgba(255,107,53,0.05))',  border: 'rgba(255,107,53,0.35)',  glow: 'rgba(255,107,53,0.45)',  text: '#ff6b35' },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)', cardBg: 'linear-gradient(145deg,rgba(243,156,18,0.15),rgba(243,156,18,0.05))',  border: 'rgba(243,156,18,0.35)',  glow: 'rgba(243,156,18,0.45)',  text: '#f39c12' },
] as const;

export const getPlayerEmoji = (index: number): string =>
  PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];

export const getPlayerPalette = (index: number): typeof PLAYER_PALETTES[number] =>
  PLAYER_PALETTES[index % PLAYER_PALETTES.length];
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/utils/playerColors.ts
git commit -m "feat: extract shared player colour palettes and emojis"
```

---

### Task 4: Update `src/utils/auth.ts`

**Files:**
- Modify: `src/utils/auth.ts`

- [ ] **Step 1: Replace file content**

```ts
import type { User } from '../types';
import { storage } from './storage';

export const getStoredUser = (): User | null => storage.getUser();

export const createUser = (name: string): User => {
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: '',
    createdAt: Date.now(),
  };
  storage.setUser(user);
  return user;
};

export const signOut = (): void => storage.clearUser();
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/utils/auth.ts
git commit -m "refactor: auth.ts — delegate localStorage I/O to storage"
```

---

### Task 5: Update `src/utils/regulars.ts`

**Files:**
- Modify: `src/utils/regulars.ts`

- [ ] **Step 1: Replace file content**

```ts
import { storage } from './storage';

export function getRegulars(): string[] {
  return storage.getRegulars();
}

export function addRegular(name: string): void {
  const current = storage.getRegulars();
  if (!current.includes(name)) {
    storage.setRegulars([...current, name]);
  }
}

export function removeRegular(name: string): void {
  storage.setRegulars(storage.getRegulars().filter(n => n !== name));
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/utils/regulars.ts
git commit -m "refactor: regulars.ts — delegate localStorage I/O to storage"
```

---

### Task 6: Update `src/utils/gameHistory.ts`

**Files:**
- Modify: `src/utils/gameHistory.ts`

- [ ] **Step 1: Replace the localStorage calls in the file**

Replace the entire file with:

```ts
import type { GameRecord, PlayerSettlement, Debt } from '../types';
import { storage } from './storage';

const MAX_HISTORY = 100;

export const getGameHistory = (userId: string): GameRecord[] =>
  storage.getGameHistory(userId);

export const saveGameRecord = (
  userId: string,
  hostsName: string,
  settlements: PlayerSettlement[],
  debts: Debt[]
): GameRecord => {
  const history = getGameHistory(userId);

  const topShark = settlements
    .filter(s => s.profitLossAfterFee > 0)
    .sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee)[0];

  const totalPot = settlements.reduce((sum, s) => sum + s.totalInvested, 0);

  const record: GameRecord = {
    id: `game_${Date.now()}`,
    date: Date.now(),
    hostsName,
    hostUserId: userId,
    totalPot,
    topShark: topShark ? {
      name: topShark.name,
      amount: parseFloat(topShark.profitLossAfterFee.toFixed(2))
    } : null,
    debts: debts.map(d => ({ from: d.from.name, to: d.to.name, amount: d.amount })),
    playerResults: settlements.map(s => ({
      name: s.name,
      profitLossAfterFee: parseFloat(s.profitLossAfterFee.toFixed(2))
    }))
  };

  history.unshift(record);
  storage.setGameHistory(userId, history.slice(0, MAX_HISTORY));

  return record;
};

export const getRecentGames = (userId: string, limit = 5): GameRecord[] =>
  getGameHistory(userId).slice(0, limit);

export const clearGameHistory = (userId: string): void =>
  storage.clearGameHistory(userId);

export const calculateCumulativeProfitLoss = (userId: string, userName: string): number => {
  const history = getGameHistory(userId);
  return history.reduce((cumulative, game) => {
    if (!game.playerResults) return cumulative;
    const hostName = game.hostUserId === userId ? game.hostsName : null;
    const userResult = game.playerResults.find(p =>
      hostName ? p.name === hostName : p.name === userName
    );
    return userResult ? cumulative + userResult.profitLossAfterFee : cumulative;
  }, 0);
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getCumulativeStatus = (cumulativePL: number, name?: string): { badge: string; message: string } => {
  const n = name ?? '';
  const amt = cumulativePL >= 0 ? `+${cumulativePL.toFixed(0)}₪` : `${cumulativePL.toFixed(0)}₪`;

  if (cumulativePL > 100) {
    return {
      badge: '🦈 הכריש של השולחן',
      message: pick([
        `${n ? `${n}, ` : ''}תביא תיק גב לסיבוב הבא — הכיסים שלך כבר עומדים להתפוצץ. (${amt})`,
        `תגיד ${n || 'חבר'}, מאיפה הביטחון? פתחת פה סניף של בנק הפועלים או שפשוט נולדת עם תלתן בתחת? (${amt})`,
        `מה זה הערימה הזאת? עוד זכייה אחת וצריך להזמין ברינקס שיפנה את ${n || 'אותו'} מהשולחן. (${amt})`,
        `חלאס, כולם פה באו לשחק פוקר, רק ${n || 'אחד'} בא לעשות אקזיט על הגב שלנו. (${amt})`,
        `חברים, תראו את ${n || 'זה'} — הפך להיות הבעלים של הבית. עוד מעט הוא יגבה מאיתנו דמי שכירות על הכיסאות. (${amt})`,
        `תראו את ${n || 'זה'}, הולך הביתה כאילו הרגע שדד תחנת דלק. אל תסתכל אחורה, יש ניידת בסיבוב. (${amt})`,
        `חברים, תעשו כבוד ל${n ? `-${n}` : 'זה'} — הבן אדם היחיד בשולחן שהגיע עם מאה שקל ויוצא עם זכיינות על הדירה. (${amt})`,
        `${n || 'הוא'} הולך לישון על מזרן של שטרות, אנחנו הולכים לישון על מזרן של דמעות. (${amt})`,
        `תגיד ${n || 'חבר'}, אתה עושה משלוחים? כי לקחת פה את כל הפרנסה של האנשים ונסעת. (${amt})`,
        `תראו את ${n || 'זה'} — עושה פרצוף של בליינד אבל בלב הוא כבר מחשב כמה פלאפל הוא קונה בכסף שלנו. (${amt})`,
      ]),
    };
  }

  if (cumulativePL > 0) {
    return {
      badge: '✅ המנצח',
      message: pick([
        `${n ? `שמע ${n}, ` : ''}לפי המאזן שלך, נראה שהקלפים עושים לך כבוד. (${amt})`,
        `${n ? `שמע ${n}, ` : ''}לפי המאזן שלך, הקלפים עושים לך כבוד יותר ממה שאתה עושה להורים שלך. (${amt})`,
      ]),
    };
  }

  if (Math.abs(cumulativePL) < 0.5) {
    return {
      badge: '😐 הפרווה',
      message: pick([
        `${n ? `תגיד ${n}, ` : ''}אתה משחק פוקר או עושה סטאז׳ בנהלת חשבונות? הכל אצלך מאוזן מדי, זה חשוד. (0₪)`,
        `${n ? `${n}, ` : ''}ישבת פה לילה שלם רק כדי להחזיר את הכסף לארנק? לך תהיה שומר בבנק. (0₪)`,
        `מה זה המאזן הזה? אתה כמו מים פושרים — לא מזיק אבל בטח שלא עושה לאף אחד כיף. (0₪)`,
        `שש שעות משחק ובסוף יצאת עם אותו שקל? בשביל זה יש טלוויזיה, לפחות היית רואה סרט. (0₪)`,
        `${n || 'אתה'} זה כמו המנוע של רכב ישן — עושה הרבה רעש, מעשן, ובסוף בקושי זז מהמקום. (0₪)`,
      ]),
    };
  }

  if (cumulativePL > -50) {
    return {
      badge: '📉 המדשדש',
      message: pick([
        `${n ? `שמע ${n}, ` : ''}המאזן שלך מזכיר את המצב הכלכלי בארץ — תמיד מרגיש שעוד רגע מסתדר, ובסוף הכל קורס. (${amt})`,
        `אתה על הקשקש, אה? עוד שקל אחד למטה ואתה מתחיל לקבץ נדבות בבליינדים. (${amt})`,
        `${n ? `${n}, ` : ''}אתה משחק על זמן שאול. תתחיל להזיע, כי עוד יד אחת ואתה הופך לסיפור של השולחן. (${amt})`,
        `תגידו, מישהו בדק דופק ל${n ? `-${n}` : 'זה'}? כי הכסף שלו נוזל מהכיס יותר מהר מטחינה בפיתה. (${amt})`,
        `אם היית מקבל שקל על כל פעם שיצאת פיתה ביד הזאת, המאזן שלך היה נראה אחרת לגמרי. (${amt})`,
      ]),
    };
  }

  return {
    badge: '🐑 התורם הגדול',
    message: pick([
      `${n ? `${n}, ` : ''}שתדע שכולנו עשינו קבוצת וואטסאפ "תודה לך" — בזכותך הסופ"ש הקרוב עלינו. (${amt})`,
      `${n ? `${n}, ` : ''}שתדע שבוועדת חריגים של השכונה החליטו להכיר בך כעמותה רשומה. יא תורם. (${amt})`,
      `${n ? `שמע ${n}, ` : ''}אם היית משקיע בללמוד לשחק כמו שאתה משקיע בלהפסיד, היינו היום בווגאס. (${amt})`,
      `${n ? `${n}, ` : ''}עזוב פוקר, לך תפתח קריירה בלוטו. לפחות שם ההפסד שלך הוא פעם בשבוע, לא כל יד. (${amt})`,
      `איזה לב זהב יש ל${n ? `-${n}` : 'זה'} — בא לשולחן רק כדי שלכולנו יהיה כסף לסיגריות מחר. (${amt})`,
      `שמע, אל תדאג, בדרך הביתה תעבור דרך המזרקה בכיכר, אולי תמצא שם כמה שקלים להתחלה חדשה. (${amt})`,
      `נראה לי ש${n ? `-${n}` : 'הוא'} לא הפסיד, הוא פשוט עשה "הפצה מחדש של העושר". יא קומוניסט עם לב זהב. (${amt})`,
      `חברים, נא לכבות את האורות — ${n || 'הוא'} השאיר פה את המכנסיים שלו על השולחן, שלא יתקרר בדרך. (${amt})`,
      `אם היה פרס על "התורם המצטיין של השנה", ${n || 'הוא'} היה מקבל אותו עם סרט. (${amt})`,
      `תגיד ${n || 'חבר'}, שבוע הבא אתה בא שוב? כי חסר לנו בדיוק סכום כזה בשביל להזמין פיצות לכולם. (${amt})`,
      `בואנה ${n || 'חבר'}, יצאת מהערב הזה כמו שיצאת מהבר מצווה — עם הרבה ברכות וכיסים ריקים. (${amt})`,
    ]),
  };
};
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/utils/gameHistory.ts
git commit -m "refactor: gameHistory.ts — delegate localStorage I/O to storage"
```

---

### Task 7: Update `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { useState, useCallback, useEffect } from 'react';
import type { GamePhase, GameSettings, Player, PlayerSettlement, Debt, User } from './types';
import { GamePhase as GamePhaseEnum } from './types';
import { Auth } from './components/Auth';
import { Lobby } from './components/Lobby';
import { GameSetup } from './components/GameSetup';
import { GameTable } from './components/GameTable';
import { EndGame } from './components/EndGame';
import { SettlementResults } from './components/SettlementResults';
import { InstallPrompt } from './components/InstallPrompt';
import { calculatePlayerSettlements, minimizeDebts } from './utils/settlements';
import { saveGameRecord } from './utils/gameHistory';
import { storage } from './utils/storage';
import './App.css';

const DEFAULT_SETTINGS: GameSettings = { nisPerBuyIn: 50, chipsPerBuyIn: 100 };

interface InitialAppState {
  user: User | null;
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  gameStartedAt: number | null;
}

const getInitialAppState = (): InitialAppState => {
  const user = storage.getUser();
  if (!user) {
    return { user: null, phase: GamePhaseEnum.AUTH, players: [], settings: DEFAULT_SETTINGS, gameStartedAt: null };
  }
  const saved = storage.getCurrentGame();
  if (saved?.players?.length) {
    return { user, phase: saved.phase, players: saved.players, settings: saved.settings, gameStartedAt: saved.gameStartedAt };
  }
  return { user, phase: GamePhaseEnum.LOBBY, players: [], settings: DEFAULT_SETTINGS, gameStartedAt: null };
};

function App() {
  const [initial] = useState(getInitialAppState);
  const [currentUser, setCurrentUser] = useState<User | null>(initial.user);
  const [phase, setPhase] = useState<GamePhase>(initial.phase);
  const [settings, setSettings] = useState<GameSettings>(initial.settings);
  const [players, setPlayers] = useState<Player[]>(initial.players);
  const [settlements, setSettlements] = useState<PlayerSettlement[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(storage.getIsPremium());
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(initial.gameStartedAt);

  useEffect(() => {
    if (phase === GamePhaseEnum.TABLE || phase === GamePhaseEnum.END_GAME) {
      storage.setCurrentGame({ phase, players, settings, gameStartedAt });
    } else if (([GamePhaseEnum.LOBBY, GamePhaseEnum.RESULTS, GamePhaseEnum.AUTH] as string[]).includes(phase)) {
      storage.clearCurrentGame();
    }
  }, [phase, players, settings, gameStartedAt]);

  const handlePremiumChange = useCallback((value: boolean) => {
    setIsPremium(value);
    storage.setIsPremium(value);
  }, []);

  const handleAuth = useCallback((user: User) => {
    setCurrentUser(user);
    setPhase(GamePhaseEnum.LOBBY);
  }, []);

  const handleStartFromLobby = useCallback((selectedNames: string[]) => {
    if (!currentUser) return;
    const hostPlayer: Player = {
      id: `host_${currentUser.id}`,
      name: currentUser.name,
      buyIns: 1,
      totalInvested: settings.nisPerBuyIn,
      finalChips: settings.chipsPerBuyIn,
      isHost: true,
    };
    const regularPlayers: Player[] = selectedNames.map((name, i) => ({
      id: `regular_${i}_${Date.now()}`,
      name,
      buyIns: 1,
      totalInvested: settings.nisPerBuyIn,
      finalChips: settings.chipsPerBuyIn,
      isHost: false,
    }));
    setPlayers([hostPlayer, ...regularPlayers]);
    setSettlements([]);
    setDebts([]);
    setPhase(GamePhaseEnum.SETUP);
  }, [currentUser, settings]);

  const handleStartGame = useCallback((newSettings: GameSettings, newPlayers: Player[]) => {
    setSettings(newSettings);
    setPlayers(newPlayers);
    setGameStartedAt(Date.now());
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
    const { settlements: ps } = calculatePlayerSettlements(updatedPlayers, settings);
    const calculatedDebts = minimizeDebts(ps);

    setSettlements(ps);
    setDebts(calculatedDebts);

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
  }, []);

  const handleQuit = useCallback(() => {
    storage.clearCurrentGame();
    setPhase(GamePhaseEnum.LOBBY);
    setPlayers([]);
  }, []);

  return (
    <div className="app">
      {phase === GamePhaseEnum.AUTH && <Auth onAuth={handleAuth} />}

      {phase === GamePhaseEnum.LOBBY && currentUser && (
        <Lobby
          onStartGame={handleStartFromLobby}
          user={currentUser}
          isPremium={isPremium}
          onPremiumChange={handlePremiumChange}
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
          gameStartedAt={gameStartedAt ?? undefined}
        />
      )}

      {phase === GamePhaseEnum.END_GAME && (
        <EndGame
          players={players}
          settings={settings}
          onCalculate={handleCalculateSettlements}
          onBack={handleBackFromEndGame}
        />
      )}

      {phase === GamePhaseEnum.RESULTS && currentUser && (
        <SettlementResults
          settlements={settlements}
          debts={debts}
          gameSettings={settings}
          onPlayAgain={resetToLobby}
          onHome={resetToLobby}
          user={currentUser}
        />
      )}

      <InstallPrompt />
    </div>
  );
}

export default App;
```

**Note:** The localStorage persistence is now handled via a plain `useState` call with an inline side effect — React guarantees this runs synchronously before paint, which is appropriate for local persistence. If the lint rule fires on this pattern, use a `useEffect` with `[phase, players, settings, gameStartedAt]` as deps instead (see Step 2).

- [ ] **Step 2: Verify clean lint and build**

```bash
npm run lint && npm run build
```

Expected: 0 errors, 0 warnings, clean build.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: App.tsx — lazy state init, remove init useEffect, use storage"
```

---

### Task 8: Update `src/components/GameSetup.tsx`

**Files:**
- Modify: `src/components/GameSetup.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings, Player } from '../types';
import { Toast } from './Toast';
import { getPlayerPalette, getPlayerEmoji } from '../utils/playerColors';
import '../styles/setup.css';

interface GameSetupProps {
  onStartGame: (settings: GameSettings, players: Player[]) => void;
  onHome: () => void;
  existingPlayers?: Player[];
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, onHome, existingPlayers = [] }) => {
  const [nisPerBuyIn, setNisPerBuyIn] = useState(50);
  const [chipsPerBuyIn, setChipsPerBuyIn] = useState(100);
  const [nisRaw, setNisRaw] = useState('50');
  const [chipsRaw, setChipsRaw] = useState('100');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>(() => existingPlayers);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const updateNis = (val: number) => { setNisPerBuyIn(val); setNisRaw(String(val)); };
  const updateChips = (val: number) => { setChipsPerBuyIn(val); setChipsRaw(String(val)); };

  const handleAddPlayer = () => {
    const trimmed = playerName.trim();
    if (trimmed && players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setToastMessage(`שחקן בשם "${trimmed}" כבר קיים`);
      return;
    }
    if (trimmed) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: trimmed,
        buyIns: 1,
        totalInvested: nisPerBuyIn,
        finalChips: chipsPerBuyIn,
        isHost: false,
      };
      setPlayers([...players, newPlayer]);
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    if (player?.isHost) {
      setToastMessage('לא ניתן להסיר את המארח');
      return;
    }
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleStart = () => {
    if (players.length >= 2) {
      const finalPlayers = players.map(p => ({
        ...p,
        totalInvested: p.buyIns * nisPerBuyIn,
        finalChips: p.buyIns * chipsPerBuyIn,
      }));
      onStartGame({ nisPerBuyIn, chipsPerBuyIn }, finalPlayers);
    }
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <h1 className="setup-title">הגדרת שולחן 🃏</h1>
        <button className="setup-back" onClick={onHome}>← חזור</button>
      </div>

      <div className="setup-body">
        <div>
          <div className="setup-section-label">הגדרות BUY-IN</div>
          <div className="setup-steppers">
            <div className="setup-stepper-card">
              <div className="setup-stepper-label">₪ לכל buy-in</div>
              <div className="setup-stepper-row">
                <button className="setup-stepper-btn minus" onClick={() => updateNis(Math.max(10, nisPerBuyIn - 5))}>−</button>
                <div className="setup-stepper-center">
                  <input
                    className="setup-stepper-value"
                    type="number"
                    inputMode="numeric"
                    value={nisRaw}
                    onChange={e => {
                      setNisRaw(e.target.value);
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v > 0) setNisPerBuyIn(v);
                    }}
                    onBlur={() => {
                      const v = Math.max(10, parseInt(nisRaw, 10) || 10);
                      updateNis(v);
                    }}
                    onFocus={e => e.target.select()}
                  />
                  <span className="setup-stepper-currency">₪</span>
                </div>
                <button className="setup-stepper-btn plus" onClick={() => updateNis(nisPerBuyIn + 5)}>+</button>
              </div>
            </div>
            <div className="setup-stepper-card">
              <div className="setup-stepper-label">ז׳יטונים לכל buy-in</div>
              <div className="setup-stepper-row">
                <button className="setup-stepper-btn minus" onClick={() => updateChips(Math.max(50, chipsPerBuyIn - 50))}>−</button>
                <input
                  className="setup-stepper-value"
                  type="number"
                  inputMode="numeric"
                  value={chipsRaw}
                  onChange={e => {
                    setChipsRaw(e.target.value);
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v > 0) setChipsPerBuyIn(v);
                  }}
                  onBlur={() => {
                    const v = Math.max(50, parseInt(chipsRaw, 10) || 50);
                    updateChips(v);
                  }}
                  onFocus={e => e.target.select()}
                />
                <button className="setup-stepper-btn plus" onClick={() => updateChips(chipsPerBuyIn + 50)}>+</button>
              </div>
            </div>
          </div>
          <div className="setup-rate-pill">
            1 ז׳יטון = {(nisPerBuyIn / chipsPerBuyIn).toFixed(2)}₪
          </div>
        </div>

        <div>
          <div className="setup-section-label">שחקנים ({players.length})</div>
          <div className="setup-players">
            {players.map((player, idx) => (
              <motion.div
                key={player.id}
                className={`setup-player-row${player.isHost ? ' host' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div
                  className="setup-player-avatar"
                  style={{ background: getPlayerPalette(idx).bg }}
                >{getPlayerEmoji(idx)}</div>
                <div className="setup-player-name">
                  {player.isHost && <span className="setup-player-host-badge">👑 מארח</span>}
                  {player.name}
                </div>
                {!player.isHost && (
                  <button className="setup-player-remove" onClick={() => handleRemovePlayer(player.id)}>✕</button>
                )}
              </motion.div>
            ))}

            <div className="setup-add-row">
              <div className="setup-add-icon">+</div>
              <input
                className="setup-add-input"
                type="text"
                placeholder="הוסף שחקן..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              />
            </div>
            {playerName.trim() && (
              <motion.button
                style={{ width: '100%', background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.25)', color: 'var(--yellow)', padding: '10px', borderRadius: 10, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                onClick={handleAddPlayer}
                whileTap={{ scale: 0.97 }}
              >+ הוסף</motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="setup-footer">
        <motion.button
          className="setup-cta"
          onClick={handleStart}
          disabled={players.length < 2}
          whileTap={{ scale: 0.97 }}
        >יאללה, מתחילים! 🚀</motion.button>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};
```

- [ ] **Step 2: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: 0 errors, 0 warnings, clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/GameSetup.tsx
git commit -m "refactor: GameSetup — lazy player init, Toast replaces alert, use playerColors"
```

---

### Task 9: Update `src/components/EndGame.tsx`

**Files:**
- Modify: `src/components/EndGame.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Player, GameSettings } from '../types';
import { getPlayerPalette, getPlayerEmoji } from '../utils/playerColors';
import '../styles/endgame.css';

interface EndGameProps {
  players: Player[];
  settings: GameSettings;
  onCalculate: (finalChips: Record<string, number>) => void;
  onBack: () => void;
}

export const EndGame: React.FC<EndGameProps> = ({ players, settings, onCalculate, onBack }) => {
  const [finalChips, setFinalChips] = useState<Record<string, number>>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: p.buyIns * settings.chipsPerBuyIn }), {})
  );
  const [rawChips, setRawChips] = useState<Record<string, string>>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: String(p.buyIns * settings.chipsPerBuyIn) }), {})
  );

  const handleChipChange = (playerId: string, value: number) => {
    const clamped = Math.max(0, value);
    setFinalChips({ ...finalChips, [playerId]: clamped });
    setRawChips({ ...rawChips, [playerId]: String(clamped) });
  };

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
        <span className="endgame-total-label">סה&quot;כ ז׳יטונים בשולחן</span>
        <span className="endgame-total-value">{totalZhetons} ז׳יטונים</span>
      </div>

      <div className="endgame-body">
        {players.map((player, index) => {
          const palette = getPlayerPalette(index);
          const emoji = getPlayerEmoji(index);
          const value = finalChips[player.id] ?? 0;

          return (
            <div
              key={player.id}
              className="endgame-player-row"
              style={{ background: palette.cardBg, border: `1px solid ${palette.border}` }}
            >
              <div
                className="endgame-player-avatar"
                style={{ background: palette.bg, boxShadow: `0 4px 12px ${palette.glow}` }}
              >{emoji}</div>
              <div className="endgame-player-info">
                <div className="endgame-player-name">{player.name}</div>
                <div className="endgame-player-invested">מושקע: {player.buyIns * settings.nisPerBuyIn}₪ (×{player.buyIns})</div>
              </div>
              <div
                className="endgame-stepper"
                style={{ border: `1px solid ${palette.border}` }}
              >
                <button
                  className="endgame-stepper-btn"
                  style={{ color: `${palette.text}60` }}
                  onClick={() => handleChipChange(player.id, Math.max(0, value - settings.chipsPerBuyIn))}
                >−</button>
                <input
                  className="endgame-stepper-value"
                  type="number"
                  inputMode="numeric"
                  value={rawChips[player.id] ?? ''}
                  onChange={e => {
                    setRawChips({ ...rawChips, [player.id]: e.target.value });
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 0) setFinalChips({ ...finalChips, [player.id]: v });
                  }}
                  onBlur={() => {
                    const v = Math.max(0, parseInt(rawChips[player.id], 10) || 0);
                    handleChipChange(player.id, v);
                  }}
                  onFocus={e => e.target.select()}
                />
                <button
                  className="endgame-stepper-btn"
                  style={{ color: palette.text }}
                  onClick={() => handleChipChange(player.id, value + settings.chipsPerBuyIn)}
                >+</button>
              </div>
            </div>
          );
        })}

        <div className={`endgame-validation ${isValid ? 'valid' : 'invalid'}`}>
          <span className="endgame-validation-label">סה&quot;כ הוזן</span>
          <span className={`endgame-validation-value ${isValid ? 'valid' : 'invalid'}`}>
            {currentTotal} {isValid ? '✅ מדויק!' : `/ ${totalZhetons}`}
          </span>
        </div>
      </div>

      <div className="endgame-footer">
        <motion.button
          className="endgame-cta"
          onClick={() => onCalculate(finalChips)}
          disabled={!isValid}
          whileTap={{ scale: 0.97 }}
        >חשב מי חייב למי 🧮</motion.button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: 0 errors, 0 warnings, clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/EndGame.tsx
git commit -m "refactor: EndGame — remove dead onHome prop, use playerColors"
```

---

### Task 10: Update `src/components/SettlementResults.tsx`

**Files:**
- Modify: `src/components/SettlementResults.tsx`

- [ ] **Step 1: Replace the PLAYER_COLORS and PLAYER_EMOJIS declarations with imports**

Remove these lines from the top of the file:
```tsx
const PLAYER_COLORS = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)' },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)' },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)' },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)' },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)' },
];
const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'];
```

Add this import after the existing imports:
```tsx
import { PLAYER_PALETTES, PLAYER_EMOJIS } from '../utils/playerColors';
```

Replace the `colorMap` construction (which references `PLAYER_COLORS`) with:
```tsx
const colorMap = new Map(sortedSettlements.map((s, i) => [s.id, {
  color: PLAYER_PALETTES[i % PLAYER_PALETTES.length],
  emoji: PLAYER_EMOJIS[i % PLAYER_EMOJIS.length],
}]));
```

Replace the fallback in the debts section:
```tsx
const from = colorMap.get(debt.from.id) ?? { color: PLAYER_PALETTES[0], emoji: PLAYER_EMOJIS[0] };
const to   = colorMap.get(debt.to.id)   ?? { color: PLAYER_PALETTES[1], emoji: PLAYER_EMOJIS[1] };
```

- [ ] **Step 2: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: 0 errors, 0 warnings, clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/SettlementResults.tsx
git commit -m "refactor: SettlementResults — use shared playerColors"
```

---

### Task 11: Update `src/components/Lobby.tsx`

**Files:**
- Modify: `src/components/Lobby.tsx`

- [ ] **Step 1: Add storage import**

Add to the imports at the top of `Lobby.tsx`:
```tsx
import { storage } from '../utils/storage';
```

- [ ] **Step 2: Replace the visited localStorage calls**

Find this block inside the `useEffect`:
```tsx
const hasVisited = localStorage.getItem('pocketAceVisited');
if (!hasVisited) {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setShowWelcome(true);
  localStorage.setItem('pocketAceVisited', 'true');
}
```

Replace with:
```tsx
if (!storage.getVisited()) {
  setShowWelcome(true);
  storage.setVisited();
}
```

- [ ] **Step 3: Run lint and build**

```bash
npm run lint && npm run build
```

Expected: 0 errors, 0 warnings, clean build.

- [ ] **Step 4: Commit**

```bash
git add src/components/Lobby.tsx
git commit -m "refactor: Lobby — use storage for visited flag"
```

---

### Task 12: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Fix stale design token reference**

Find in the Styling section:
```
- Key tokens: `--yellow` (`#f5c518`) is the primary brand/CTA color; `--bg-primary` (`#080810`) is the base background
```

Replace with:
```
- Key tokens: `--gold` (`#C49A2C`) is the primary brand/CTA color (aliased as `--yellow` for legacy components); `--bg-primary` (`var(--bg0)` = `#1A1614`) is the base background
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: fix stale design token references in CLAUDE.md"
```

---

### Task 13: Final Verification

- [ ] **Step 1: Run full lint check — expect zero issues**

```bash
npm run lint
```

Expected output:
```
(no output — exit code 0)
```

- [ ] **Step 2: Run full build — expect clean output**

```bash
npm run build
```

Expected output ends with:
```
✓ built in ...ms
```

No TypeScript errors, no warnings.

- [ ] **Step 3: Verify all localStorage keys are gone from non-storage files**

```bash
grep -r "localStorage" src/ --include="*.ts" --include="*.tsx" | grep -v "src/utils/storage.ts"
```

Expected: only `loserInsults.ts` and `winnerInsults.ts` may appear (they manage their own shuffle-state keys internally and are intentionally self-contained). No other files should reference `localStorage` directly.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: foundation cleanup complete — storage layer, playerColors, lint clean"
```
