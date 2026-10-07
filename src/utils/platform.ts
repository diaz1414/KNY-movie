import { Capacitor } from '@capacitor/core';

export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

export const isNative = () => {
  return Capacitor.isNativePlatform();
};

export const isPageReload = (): boolean => {
  try {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === 'reload';
    }
    return (performance as any).navigation?.type === 1;
  } catch (e) {
    return false;
  }
};
