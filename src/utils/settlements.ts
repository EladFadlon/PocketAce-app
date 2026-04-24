import type { Player, GameSettings, PlayerSettlement, Debt } from '../types';

const SHARK_THRESHOLD_AGOROT = 1000; // ±10₪ before we call someone shark/donor
const APP_URL = 'https://pocketace.app';

const nisToAgorot = (nis: number): number => Math.round(nis * 100);
const agorotToNis = (agorot: number): number => agorot / 100;

const POKER_COMMENTS = {
  SHARK: [
    '🦈 שדפת קופה כמו שודד לאור יום',
    '🦈 זה לא צדק, זה גנבה לאור יום',
    '🦈 בא לך שולחן משלך לרמות בו?',
    '🦈 תרופה טובה לחוסר ביטחון עצמי',
    '🦈 הגר עולה, הכריש רוכב',
    '🦈 עכשיו זה צו שקט מלכותי'
  ],
  DONOR: [
    '🤡 תודה שתרמת לעמותה שלנו',
    '🤡 כך זה יוצא כשמשחקים נגד אנשים שיודעים',
    '🤡 בא לך לנחשל עוד פעם?',
    '🤡 סליחה ילד, זה שולחן גדולים',
    '🤡 אולי תשחק סנוקר בשביל שינוי',
    '🤡 לא כל אחד נולד לפוקר, ולא כל אחד צריך לשחק'
  ],
  NEUTRAL: [
    '😐 שחקת כמו הירון – לא הרבה פעמים',
    '😐 היה לך את הביטחון של משכנתא',
    '😐 אדיוס בתור הכל',
    '😐 אפילו לא עברת לסיבוב הבא',
    '😐 מישהו שיקח את השולחן הבא?'
  ]
};

const getRandomComment = (category: 'SHARK' | 'DONOR' | 'NEUTRAL'): string => {
  const list = POKER_COMMENTS[category];
  return list[Math.floor(Math.random() * list.length)];
};

export const calculatePlayerSettlements = (
  players: Player[],
  gameSettings: GameSettings
): { settlements: PlayerSettlement[] } => {
  const nisPerBuyInAgorot = nisToAgorot(gameSettings.nisPerBuyIn);
  const chipsPerBuyIn = gameSettings.chipsPerBuyIn;

  const settlements: PlayerSettlement[] = players.map(player => {
    const chipsGained = player.finalChips - player.buyIns * chipsPerBuyIn;
    const profitLossAgorot = Math.round((chipsGained / chipsPerBuyIn) * nisPerBuyInAgorot);
    return {
      ...player,
      profitLoss: agorotToNis(profitLossAgorot),
      profitLossAfterFee: agorotToNis(profitLossAgorot),
      profitLossAfterFeeAgorot: profitLossAgorot,
    };
  });

  return { settlements };
};

/**
 * Greedy debt minimization. Uses profitLossAfterFeeAgorot directly
 * — no NIS↔agorot round-trip that could reintroduce float error.
 */
export const minimizeDebts = (settlements: PlayerSettlement[]): Debt[] => {
  const debts: Debt[] = [];

  const winners = settlements
    .filter(s => s.profitLossAfterFeeAgorot > 1)
    .map(s => ({ ...s, remaining: s.profitLossAfterFeeAgorot }))
    .sort((a, b) => b.remaining - a.remaining);

  const losers = settlements
    .filter(s => s.profitLossAfterFeeAgorot < -1)
    .map(s => ({ ...s, remaining: Math.abs(s.profitLossAfterFeeAgorot) }))
    .sort((a, b) => b.remaining - a.remaining);

  let wi = 0, li = 0;
  while (wi < winners.length && li < losers.length) {
    const transfer = Math.min(winners[wi].remaining, losers[li].remaining);
    if (transfer > 0) {
      debts.push({ from: losers[li], to: winners[wi], amount: agorotToNis(transfer) });
      winners[wi].remaining -= transfer;
      losers[li].remaining -= transfer;
    }
    if (winners[wi].remaining === 0) wi++;
    if (losers[li].remaining === 0) li++;
  }

  return debts;
};

export const generateWhatsAppMessage = (
  _gameSettings: GameSettings,
  settlements: PlayerSettlement[],
  debts: Debt[]
): string => {
  const winners = settlements
    .filter(s => s.profitLossAfterFee > 0)
    .sort((a, b) => b.profitLossAfterFee - a.profitLossAfterFee);
  const losers = settlements
    .filter(s => s.profitLossAfterFee < 0)
    .sort((a, b) => a.profitLossAfterFee - b.profitLossAfterFee);

  const topShark = winners[0];
  const worstDonor = losers[0];

  const dateStr = new Date().toLocaleDateString('he-IL', {
    year: 'numeric', month: 'numeric', day: 'numeric',
  });

  let msg = `*🃏 Pocket Ace – סיכום מושחק 🃏*\n`;
  msg += `📅 ${dateStr}\n`;
  msg += `${'═'.repeat(32)}\n\n`;

  if (topShark) {
    if (topShark.profitLossAfterFeeAgorot >= SHARK_THRESHOLD_AGOROT) {
      msg += `*🦈 כריש הלילה: ${topShark.name}*\n`;
      msg += `${getRandomComment('SHARK')}\n`;
    } else {
      msg += `*🏆 מוביל: ${topShark.name}*\n`;
    }
    msg += `💰 ניצחון: +${topShark.profitLossAfterFee.toFixed(0)}₪\n\n`;
  }

  if (worstDonor && !worstDonor.isHost) {
    if (worstDonor.profitLossAfterFeeAgorot <= -SHARK_THRESHOLD_AGOROT) {
      msg += `*🤡 התורם של הלילה: ${worstDonor.name}*\n`;
      msg += `${getRandomComment('DONOR')}\n`;
    } else {
      msg += `*📉 מפסיד: ${worstDonor.name}*\n`;
    }
    msg += `📉 הפסד: ${worstDonor.profitLossAfterFee.toFixed(0)}₪\n\n`;
  }

  if (debts.length > 0) {
    msg += `*💸 מי שחייב – שישלם עכשיו (ביט/פייבוקס):*\n`;
    msg += `${'─'.repeat(32)}\n`;
    debts.forEach((debt, i) => {
      msg += `${i + 1}. ${debt.from.name} ⟶ ${debt.to.name}: ${debt.amount.toFixed(0)}₪\n`;
    });
    msg += `${'─'.repeat(32)}\n\n`;
  }

  msg += `*📊 סטטיסטיקות:*\n`;
  msg += `🏆 מנצחים: ${winners.length} | 📉 מפסידים: ${losers.length} | 🎯 חובות: ${debts.length}\n\n`;
  msg += `🎰 *ניהול פוקר בסטייל? Pocket Ace!*\n`;
  msg += `👉 ${APP_URL}\n\n`;
  msg += `_♠️ Pocket Ace ♠️_`;

  return msg;
};

export const getWhatsAppShareURL = (message: string): string =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;
