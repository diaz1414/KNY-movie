import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAndroid } from '../utils/platform';

export const useAndroidBack = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  // Keep locationRef updated with the latest location object
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!isAndroid()) return;

    let active = true;
    let backListener: any = null;

    // --- HARDWARE BACK BUTTON ---
    const setupBackButton = async () => {
      backListener = await App.addListener('backButton', () => {
        const currentPath = locationRef.current.pathname;
        if (currentPath === '/' || currentPath === '/home') {
          App.minimizeApp();
        } else {
          // Use React Router's navigate to ensure proper state sync
          navigate(-1);
        }
      });

      if (!active && backListener) {
        backListener.remove();
      }
    };

    setupBackButton();

    // --- GESTURE SWIPE NAVIGATION ---
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 80; // pixels
    const EDGE_THRESHOLD = 50;  // pixels from edge

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Horizontal swipe only if vertical movement is small
      if (deltaY < 100) {
        // Swipe Right (Back) - from left edge
        if (deltaX > SWIPE_THRESHOLD && touchStartX < EDGE_THRESHOLD) {
          const currentPath = locationRef.current.pathname;
          if (currentPath === '/' || currentPath === '/home') {
            App.minimizeApp();
          } else {
            navigate(-1);
          }
        }
        // Swipe Left (Forward) - from right edge
        else if (deltaX < -SWIPE_THRESHOLD && touchStartX > window.innerWidth - EDGE_THRESHOLD) {
          navigate(1);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart as unknown as EventListener);
    window.addEventListener('touchend', handleTouchEnd as unknown as EventListener);

    return () => {
      active = false;
      if (backListener) {
        backListener.remove();
      }
      window.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      window.removeEventListener('touchend', handleTouchEnd as unknown as EventListener);
    };
  }, [navigate]);
};

