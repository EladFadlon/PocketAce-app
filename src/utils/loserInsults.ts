const INSULTS_KEY = 'pocketAce_loserInsults';

const ALL_INSULTS = [
  '{name}, אחי... הקלפים דיברו. 🃏😬',
  '{name} שילם את הכיבוד לכולם. תודה אחי 🙏',
  '{name} — המפסיד הרשמי. יש פעם הבאה אחי 😅',
  '{name}, הפוקר לא עבורך הערב 😂 תחזור חזק',
  '{name}, הערב הקלפים החליטו בלעדיך 🃏',
  '{name} — ליגת האלופים ממתינה. הערב לא. 💀',
  'מישהו צריך לשלם את הפיצה? {name} פה 🍕😂',
  'הניסיון לא עולה כלום. הכסף של {name} כן 😅',
];

function loadQueue(): string[] {
  try {
    const stored = localStorage.getItem(INSULTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: string[]): void {
  localStorage.setItem(INSULTS_KEY, JSON.stringify(queue));
}

function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getLoserInsult(name: string): string {
  let queue = loadQueue();
  if (queue.length === 0) {
    queue = shuffle(ALL_INSULTS);
  }
  const template = queue.shift()!;
  saveQueue(queue);
  return template.replace('{name}', name);
}
