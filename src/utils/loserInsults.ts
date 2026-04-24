const INSULTS_KEY = 'pocketAce_loserInsults';

const ALL_INSULTS = [
  '{name}, שתדע שבוועדת חריגים של השכונה החליטו להכיר בך כעמותה רשומה. יא תורם. 🏛️😂',
  'תגידו, מישהו בדק דופק ל-{name}? 💀 כי הכסף שלו נוזל מהכיס יותר מהר מטחינה בפיתה. 🥙💸',
  'שמע, אם {name} היה משקיע בללמוד לשחק כמו שהוא משקיע בלהפסיד, היינו היום בווגאס. 🎰✈️',
  '{name}, עזוב פוקר 🃏, לך תפתח קריירה בלוטו. לפחות שם ההפסד שלך הוא פעם בשבוע, לא כל יד. 😬🎟️',
  'איזה לב זהב יש ל-{name} ❤️, בא לשולחן רק כדי שלכולנו יהיה כסף לסיגריות מחר. 🚬😂',
  '{name}, שתדע שכולנו עשינו קבוצת וואטסאפ \'תודה ל-{name}\' 📲, בזכותך הסופ"ש הקרוב עלינו. 🙏😂',
  'שמע, אל תדאג {name}, בדרך הביתה תעבור דרך המזרקה בכיכר 🪙, אולי תמצא שם כמה שקלים להתחלה חדשה. 😅',
  'נראה לי ש-{name} לא הפסיד, הוא פשוט עשה \'הפצה מחדש של העושר\' 🤝. יא קומוניסט עם לב זהב. ❤️😂',
  'חברים, נא לכבות את האורות 💡, {name} השאיר פה את המכנסיים שלו על השולחן, שלא יתקרר בדרך. 🩲😂',
  'אם היה פרס על \'התורם המצטיין של השנה\' 🏆, {name} היה מקבל אותו עם סרט. 🎗️😂',
  'תראו את {name}, עושה פרצוף של בליינד 😶 אבל בלב הוא כבר מחשב כמה פלאפל הוא קונה בכסף שלנו. 🧆😂',
  'אם היית מקבל שקל על כל פעם שיצאת פיתה ביד הזאת {name} 🫓, המאזן שלך היה נראה אחרת לגמרי. 😅',
  'תגיד {name}, שבוע הבא אתה בא שוב? 🔄 כי חסר לנו בדיוק סכום כזה בשביל להזמין פיצות לכולם. 🍕😂',
  'בואנה {name}, יצאת מהערב הזה כמו שיצאת מהבר מצווה 🎉 – עם הרבה ברכות וכיסים ריקים. 👛😂',
  'שמע {name}, פעם הבאה שאתה רוצה לחלק כסף 💸, פשוט תשלח ביט, חבל על הזמן של הדילר. 😂📲',
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
  return template.replaceAll('{name}', name);
}
