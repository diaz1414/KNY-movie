import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const AD_REDIRECT_URL = 'https://www.effectivecpmnetwork.com/iadikppi?key=1ef3c31f6d59e0b786859466ce1bb939';
const AD_COOLDOWN_MS = 45 * 60 * 1000;
const AD_LAST_SHOWN_KEY = 'ykn_last_ad_redirect_at';
const AD_SESSION_KEY = 'ykn_ad_shown_this_session';

export const isNativeAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

const shouldShowAdRedirect = () => {
  if (typeof window === 'undefined') return false;
  const lastShown = Number(window.sessionStorage.getItem(AD_LAST_SHOWN_KEY) || '0');
  return !lastShown || Date.now() - lastShown >= AD_COOLDOWN_MS;
};

/**
 * Trigger ad ONCE per session on app start (Android).
 * Call this in App.tsx on mount.
 */
export const triggerAdOnce = () => {
  if (typeof window === 'undefined') return;
  if (!isNativeAndroid()) return; // web handles ad on card click
  if (window.sessionStorage.getItem(AD_SESSION_KEY)) return;
  window.sessionStorage.setItem(AD_SESSION_KEY, '1');
  Browser.open({ url: AD_REDIRECT_URL }).catch((err) =>
    console.error('Failed to open Android ad browser:', err)
  );
};

/**
 * Navigate with ad redirect.
 * - Web: opens ad in new tab (with cooldown), then navigates via window.location.href
 * - Android APK: uses React Router navigate() directly (no popup, ad shown on session start)
 * 
 * @param targetUrl - the /watch?id=... route
 * @param navigateFn - React Router's navigate() function (required for Android)
 */
export const navigateWithAdRedirect = (
  targetUrl: string,
  navigateFn?: (url: string) => void
) => {
  if (typeof window === 'undefined') return;

  // Android: use React Router navigate (fast, no popup interference)
  if (isNativeAndroid()) {
    if (navigateFn) {
      navigateFn(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
    return;
  }

  // Web: show ad in new tab with cooldown, then navigate
  if (shouldShowAdRedirect()) {
    window.sessionStorage.setItem(AD_LAST_SHOWN_KEY, String(Date.now()));
    window.open(AD_REDIRECT_URL, '_blank', 'noopener,noreferrer');
  }

  window.location.href = targetUrl;
};
