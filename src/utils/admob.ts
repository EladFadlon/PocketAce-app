import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import type { AdOptions, BannerAdOptions } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// Google's official test ad unit IDs — replace with real IDs from AdMob console before release
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';
const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';

// Replace these with real IDs from AdMob console after creating the app there
export const PROD_BANNER_IOS = 'ca-app-pub-REPLACE_ME/REPLACE_ME';
export const PROD_BANNER_ANDROID = 'ca-app-pub-REPLACE_ME/REPLACE_ME';
export const PROD_INTERSTITIAL_IOS = 'ca-app-pub-REPLACE_ME/REPLACE_ME';
export const PROD_INTERSTITIAL_ANDROID = 'ca-app-pub-REPLACE_ME/REPLACE_ME';

const isIos = () => Capacitor.getPlatform() === 'ios';
const isNative = () => Capacitor.isNativePlatform();

export const initializeAdMob = async (): Promise<void> => {
  if (!isNative()) return;
  await AdMob.initialize();
  // Request iOS 14+ tracking authorization (no-op on Android)
  await AdMob.requestTrackingAuthorization();
};

export const showBannerAd = async (): Promise<void> => {
  if (!isNative()) return;
  const options: BannerAdOptions = {
    adId: isIos() ? TEST_BANNER_IOS : TEST_BANNER_ANDROID,
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: true,
  };
  await AdMob.showBanner(options);
};

export const hideBannerAd = async (): Promise<void> => {
  if (!isNative()) return;
  await AdMob.hideBanner();
};

export const removeBannerAd = async (): Promise<void> => {
  if (!isNative()) return;
  await AdMob.removeBanner();
};

export const showInterstitialAd = async (): Promise<void> => {
  if (!isNative()) return;
  const options: AdOptions = {
    adId: isIos() ? TEST_INTERSTITIAL_IOS : TEST_INTERSTITIAL_ANDROID,
    isTesting: true,
  };
  await AdMob.prepareInterstitial(options);
  await AdMob.showInterstitial();
};
