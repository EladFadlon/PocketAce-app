import type { GameRecord, PlayerSettlement, Debt } from '../types';

const GAME_HISTORY_KEY = 'pocketAce_gameHistory';

/**
 * Get game history for current user
 */
export const getGameHistory = (userId: string): GameRecord[] => {
  try {
    const stored = localStorage.getItem(`${GAME_HISTORY_KEY}_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save game record to user's history
 */
export const saveGameRecord = (
  userId: string,
  hostsName: string,
  settlements: PlayerSettlement[],
  debts: Debt[]
) => {
  const history = getGameHistory(userId);
  
  const topShark = settlements
    .filter(s => s.profitLossAfterFee > 0)
    .sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee)[0];
  
  const totalPot = settlements.reduce((sum, s) => sum + s.totalInvested, 0);
  
  const record: GameRecord = {
    id: `game_${Date.now()}`,
    date: Date.now(),
    hostsName,
    totalPot,
    topShark: topShark ? {
      name: topShark.name,
      amount: parseFloat(topShark.profitLossAfterFee.toFixed(2))
    } : null,
    debts: debts.map(d => ({
      from: d.from.name,
      to: d.to.name,
      amount: d.amount
    })),
    playerResults: settlements.map(s => ({
      name: s.name,
      profitLossAfterFee: parseFloat(s.profitLossAfterFee.toFixed(2))
    }))
  };
  
  history.unshift(record); // Add to top
  localStorage.setItem(`${GAME_HISTORY_KEY}_${userId}`, JSON.stringify(history));
  
  return record;
};

/**
 * Get recent games (last N games)
 */
export const getRecentGames = (userId: string, limit: number = 5): GameRecord[] => {
  return getGameHistory(userId).slice(0, limit);
};

/**
 * Clear game history
 */
export const clearGameHistory = (userId: string) => {
  localStorage.removeItem(`${GAME_HISTORY_KEY}_${userId}`);
};

/**
 * Calculate cumulative profit/loss for a user across all games (in red or green)
 */
export const calculateCumulativeProfitLoss = (userId: string, userName: string): number => {
  const history = getGameHistory(userId);
  
  return history.reduce((cumulative, game) => {
    if (!game.playerResults) return cumulative;
    
    const userResult = game.playerResults.find(p => p.name === userName);
    if (!userResult) return cumulative;
    
    return cumulative + userResult.profitLossAfterFee;
  }, 0);
};

export const getCumulativeStatus = (cumulativePL: number, name?: string): { badge: string; message: string } => {
  const n = name ?? '';
  if (cumulativePL > 100) {
    return {
      badge: '🦈 הכריש של השולחן',
      message: `${n ? `${n}, ` : ''}תביא תיק גב לסיבוב הבא — הכיסים שלך כבר עומדים להתפוצץ. (+${cumulativePL.toFixed(2)}₪)`,
    };
  } else if (cumulativePL > 0) {
    return {
      badge: '✅ המנצח',
      message: `${n ? `שמע ${n}, ` : ''}לפי המאזן שלך, נראה שהקלפים עושים לך כבוד. (+${cumulativePL.toFixed(2)}₪)`,
    };
  } else if (cumulativePL === 0) {
    return {
      badge: '😐 הפרווה',
      message: `${n ? `תגיד ${n}, ` : ''}אתה משחק פוקר או עושה סטאז' בנהלת חשבונות? הכל אצלך מאוזן מדי, זה חשוד. (0₪)`,
    };
  } else if (cumulativePL > -50) {
    return {
      badge: '📉 המדשדש',
      message: `${n ? `שמע ${n}, ` : ''}המאזן שלך מזכיר את המצב הכלכלי בארץ — תמיד מרגיש שעוד רגע מסתדר, ובסוף הכל קורס. (${cumulativePL.toFixed(2)}₪)`,
    };
  } else {
    return {
      badge: '🐑 התורם הגדול',
      message: `${n ? `${n}, ` : ''}שתדע שכולנו עשינו קבוצת וואטסאפ "תודה לך" — בזכותך הסופ"ש הקרוב עלינו. (${cumulativePL.toFixed(2)}₪)`,
    };
  }
};
