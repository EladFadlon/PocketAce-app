import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// Replace these with real API keys from your RevenueCat dashboard
export const REVENUECAT_API_KEY_IOS = 'appl_REPLACE_ME';
export const REVENUECAT_API_KEY_ANDROID = 'goog_REPLACE_ME';

const PREMIUM_ENTITLEMENT_ID = 'premium';

const isIos = () => Capacitor.getPlatform() === 'ios';
const isNative = () => Capacitor.isNativePlatform();

export const initializePurchases = async (userId: string): Promise<void> => {
  if (!isNative()) return;
  const apiKey = isIos() ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  await Purchases.configure({ apiKey, appUserID: userId });
  if (import.meta.env.DEV) {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  }
};

export const checkPremiumStatus = async (): Promise<boolean> => {
  if (!isNative()) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
};

export const purchaseRemoveAds = async (): Promise<boolean> => {
  if (!isNative()) return false;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    if (!pkg) return false;
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  if (!isNative()) return false;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
};
