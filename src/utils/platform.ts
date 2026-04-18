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
