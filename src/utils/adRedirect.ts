const AD_REDIRECT_URL = 'https://www.effectivecpmnetwork.com/iadikppi?key=1ef3c31f6d59e0b786859466ce1bb939';
const AD_COOLDOWN_MS = 45 * 60 * 1000;
const AD_LAST_SHOWN_KEY = 'ykn_last_ad_redirect_at';

type CapacitorBridge = {
  getPlatform?: () => string;
};

const getCapacitor = () => {
  return (window as Window & { Capacitor?: CapacitorBridge }).Capacitor;
};

const isAndroidWebView = () => {
  return getCapacitor()?.getPlatform?.() === 'android';
};

const shouldShowAdRedirect = () => {
  if (typeof window === 'undefined') return false;

  const lastShown = Number(window.sessionStorage.getItem(AD_LAST_SHOWN_KEY) || '0');
  return !lastShown || Date.now() - lastShown >= AD_COOLDOWN_MS;
};

export const navigateWithAdRedirect = (targetUrl: string) => {
  if (typeof window === 'undefined') return;

  if (isAndroidWebView()) {
    window.location.href = targetUrl;
    return;
  }

  if (shouldShowAdRedirect()) {
    window.sessionStorage.setItem(AD_LAST_SHOWN_KEY, String(Date.now()));
    window.open(AD_REDIRECT_URL, '_blank', 'noopener,noreferrer');
  }

  window.location.href = targetUrl;
};
