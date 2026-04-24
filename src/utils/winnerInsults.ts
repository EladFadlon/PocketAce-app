const WINNER_INSULTS_KEY = 'pocketAce_winnerInsults';

const ALL_WINNER_INSULTS = [
  'תגיד {name}, מאיפה הביטחון? 😏 פתחת פה סניף של בנק הפועלים או שפשוט נולדת עם תלתן בתחת? 🍀',
  'מה זה הערימה הזאת? 💰 עוד זכייה אחת וצריך להזמין ברינקס שיפנה את {name} מהשולחן. 🚐',
  'חלאס, כולם פה באו לשחק פוקר, רק {name} בא לעשות אקזיט על הגב שלנו. 🤑📈',
  'שמע, לפי המאזן של {name}, נראה לי שהקלפים עושים לו כבוד יותר ממה שהוא עושה להורים שלו. 🃏👑',
  'חברים, תראו את {name}, הפך להיות הבעלים של הבית. 🏠 עוד מעט הוא יגבה מאיתנו דמי שכירות על הכיסאות. 😂💸',
  'תראו את {name}, הולך הביתה כאילו הוא הרגע שדד תחנת דלק. ⛽🚨 אל תסתכל אחורה, יש ניידת בסיבוב.',
  'שמע {name}, פעם הבאה תביא איתך תיק גב 🎒, הכיסים שלך כבר עומדים להתפוצץ מהכסף של החברים שלך. 💥💰',
  'חברים, תעשו כבוד ל-{name} 👏, הבן אדם היחיד בשולחן שהגיע עם מאה שקל ויוצא עם זכיינות על הדירה. 🏢😂',
  'איזה לילה טוב ואיזה נעליים? 😴 {name} הולך לישון על מזרן של שטרות 💵, אנחנו הולכים לישון על מזרן של דמעות. 😭',
  'תגיד {name}, אתה עושה משלוחים? 🛵 כי לקחת פה את כל הפרנסה של האנשים ונסעת. 💨😈',
];

function loadQueue(): string[] {
  try {
    const stored = localStorage.getItem(WINNER_INSULTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: string[]): void {
  localStorage.setItem(WINNER_INSULTS_KEY, JSON.stringify(queue));
}

function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getWinnerInsult(name: string): string {
  let queue = loadQueue();
  if (queue.length === 0) {
    queue = shuffle(ALL_WINNER_INSULTS);
  }
  const template = queue.shift()!;
  saveQueue(queue);
  return template.replace('{name}', name);
}
