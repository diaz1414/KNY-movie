import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAndroidBack = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const backButtonHandler = async () => {
      const listener = await App.addListener('backButton', () => {
        // If we are at the main entry point or home screen, minimize the app
        if (location.pathname === '/' || location.pathname === '/home') {
          App.minimizeApp();
        } else {
          // Otherwise, navigate backwards in history
          window.history.back();
        }
      });

      return listener;
    };

    const listenerPromise = backButtonHandler();

    return () => {
      listenerPromise.then(l => l.remove());
    };
  }, [location, navigate]);
};
