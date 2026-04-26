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
      amount: parseFloat(topShark.profitLossAfterFee.toFixed(2)),
    } : null,
    debts: debts.map(d => ({ from: d.from.name, to: d.to.name, amount: d.amount })),
    playerResults: settlements.map(s => ({
      name: s.name,
      profitLossAfterFee: parseFloat(s.profitLossAfterFee.toFixed(2)),
    })),
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
