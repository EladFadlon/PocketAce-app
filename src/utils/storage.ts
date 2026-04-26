import type { User, GameRecord, SavedGame } from '../types';

const KEYS = {
  USER:              'pocketAce_user',
  CURRENT_GAME:      'pocketAce_currentGame',
  REGULARS:          'pocketAce_regulars',
  IS_PREMIUM:        'pocketAce_isPremium',
  VISITED:           'pocketAceVisited',
  INSTALL_DISMISSED: 'pocketAce_installDismissed',
  gameHistory:       (userId: string) => `pocketAce_gameHistory_${userId}`,
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
  getUser():         User | null { return parse<User | null>(KEYS.USER, null); },
  setUser(u: User):  void        { write(KEYS.USER, u); },
  clearUser():       void        { localStorage.removeItem(KEYS.USER); },

  // ── In-progress game ───────────────────────────────────
  getCurrentGame():             SavedGame | null { return parse<SavedGame | null>(KEYS.CURRENT_GAME, null); },
  setCurrentGame(g: SavedGame): void             { write(KEYS.CURRENT_GAME, g); },
  clearCurrentGame():           void             { localStorage.removeItem(KEYS.CURRENT_GAME); },

  // ── Regulars roster ────────────────────────────────────
  getRegulars():             string[] { return parse<string[]>(KEYS.REGULARS, []); },
  setRegulars(n: string[]):  void     { write(KEYS.REGULARS, n); },

  // ── Premium flag ───────────────────────────────────────
  getIsPremium(): boolean { return localStorage.getItem(KEYS.IS_PREMIUM) === 'true'; },
  setIsPremium(val: boolean): void {
    if (val) localStorage.setItem(KEYS.IS_PREMIUM, 'true');
    else     localStorage.removeItem(KEYS.IS_PREMIUM);
  },

  // ── First-visit flag ───────────────────────────────────
  getVisited(): boolean { return localStorage.getItem(KEYS.VISITED) === 'true'; },
  setVisited(): void    { localStorage.setItem(KEYS.VISITED, 'true'); },

  // ── PWA install dismissed ──────────────────────────────
  getInstallDismissed(): boolean { return !!localStorage.getItem(KEYS.INSTALL_DISMISSED); },
  setInstallDismissed(): void    { localStorage.setItem(KEYS.INSTALL_DISMISSED, '1'); },

  // ── Game history (per user) ────────────────────────────
  getGameHistory(userId: string):                  GameRecord[] { return parse<GameRecord[]>(KEYS.gameHistory(userId), []); },
  setGameHistory(userId: string, r: GameRecord[]): void         { write(KEYS.gameHistory(userId), r); },
  clearGameHistory(userId: string):                void         { localStorage.removeItem(KEYS.gameHistory(userId)); },
};
