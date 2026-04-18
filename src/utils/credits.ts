/**
 * Credits & In-App Purchase System
 */

export interface CreditPackage {
  id: string;
  name: string;
  games: number;
  price: number;
  bestValue?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'fish', name: 'Fish', games: 5, price: 25 },
  { id: 'regular', name: 'Regular', games: 15, price: 60, bestValue: true },
  { id: 'shark', name: 'Shark', games: 50, price: 150 },
];

/**
 * Track if user received welcome gift (new account only)
 */
const WELCOME_GIFT_KEY = 'pocketAce_welcomeGiftReceived';

export const hasReceivedWelcomeGift = (userId: string): boolean => {
  try {
    const received = localStorage.getItem(`${WELCOME_GIFT_KEY}_${userId}`);
    return received === 'true';
  } catch {
    return false;
  }
};

export const markWelcomeGiftReceived = (userId: string) => {
  localStorage.setItem(`${WELCOME_GIFT_KEY}_${userId}`, 'true');
};

/**
 * Mock purchase simulation (2 seconds loading time)
 */
export const simulatePurchase = async (packageId: string): Promise<number> => {
  // Simulate 2 second transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
  if (!pkg) throw new Error('Package not found');
  
  // Return number of credits (games) purchased
  return pkg.games;
};

/**
 * Get purchase success message (with sarcasm)
 */
export const getPurchaseSuccessMessage = (packageName: string, games: number): string => {
  const messages = [
    `🎉 ברכה! קנית את חבילת ${packageName} - ${games} משחקים עוד לפני שתקלע!`,
    `💎 ממכן! כבר יש לך ${games} משחקים... בבקשה אל תהיה תורם במחשבה!`,
    `🦈 יתןן בזהירות! עכשיו יש לך ביתר כוח כדי לשדוד קופה עם ${games} משחקים!`,
    `🎮 נחמד! ${games} משחקים חדשים בהמתנה. שודד את עצמך בחזרה למימון!`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};
