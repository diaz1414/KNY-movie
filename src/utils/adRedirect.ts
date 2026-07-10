const AD_REDIRECT_URL = 'https://www.effectivecpmnetwork.com/iadikppi?key=1ef3c31f6d59e0b786859466ce1bb939';
const AD_COOLDOWN_MS = 45 * 60 * 1000;
const AD_LAST_SHOWN_KEY = 'ykn_last_ad_redirect_at';

const shouldShowAdRedirect = () => {
  if (typeof window === 'undefined') return false;

  const lastShown = Number(window.sessionStorage.getItem(AD_LAST_SHOWN_KEY) || '0');
  return !lastShown || Date.now() - lastShown >= AD_COOLDOWN_MS;
};

export const navigateWithAdRedirect = (targetUrl: string) => {
  if (typeof window === 'undefined') return;

  if (shouldShowAdRedirect()) {
    window.sessionStorage.setItem(AD_LAST_SHOWN_KEY, String(Date.now()));
    window.open(AD_REDIRECT_URL, '_blank', 'noopener,noreferrer');
  }

  window.location.href = targetUrl;
};
