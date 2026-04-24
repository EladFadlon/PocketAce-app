const WINNER_INSULTS_KEY = 'pocketAce_winnerInsults';

const ALL_WINNER_INSULTS = [
  '{name} לקח את הכסף של כולם. שיהיה בריא 🦈💸',
  'הערב {name} היה אלוהים. שאר האנשים? פחות 😂',
  '{name} — כן, הוא יזכיר לכם את זה שנה שלמה 😈',
  'מישהו יכול לעצור את {name}? שואל בנימוס 🙏😅',
  '{name} לא בא לשחק פוקר. הוא בא לגנוב 🤑',
  'זה לא מזל, זה כישרון. (טוב, בעיקר מזל) 🎰 — {name}',
  '{name} כבר מחפש לאן להוציא את הכסף שלכם 🛍️😂',
  'שאלו את {name} איך זה מרגיש. הוא לא מפסיק לחייך 😁',
  '{name} — הסיבה שלא תישנו טוב הלילה 💀',
  'יש לאחד פה מזל של סוס 🐴. {name}, שלום אחי',
  'תרגישו חופשי לשנוא את {name} הערב. מגיע לו 😂❤️',
  '{name} ניפץ אתכם בלי מאמץ. אפילו לא התאמץ 😴',
  'כולם תרמו לקרן {name}. מבצע צדקה מוצלח 🎁😂',
  'יש מישהו שרצה שזה לא יהיה {name}? כולם? יאללה 😂',
  '{name} יצא עם הארנק שלכם. חפשו בבית שלו 💰😂',
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
