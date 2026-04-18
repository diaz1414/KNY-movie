import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Genre from './pages/Genre';
import SeriesGenre from './pages/SeriesGenre';
import Maintenance from './pages/Maintenance';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import NetflixIntro from './components/NetflixIntro';
import NotFound from './pages/NotFound';
import News from './pages/News';
import OfflineOverlay from './components/OfflineOverlay';
import { isAndroid } from './utils/platform';
import { Network } from '@capacitor/network';

import UpdateModal from './components/UpdateModal';

const App: React.FC = () => {
  const [isAndroidOffline, setIsAndroidOffline] = useState(false);

  useEffect(() => {
    if (isAndroid()) {
      const checkStatus = async () => {
        const status = await Network.getStatus();
        setIsAndroidOffline(!status.connected);
      };
      checkStatus();

      const listener = Network.addListener('networkStatusChange', status => {
        setIsAndroidOffline(!status.connected);
      });

      // --- GESTURE NAVIGATION (SWIPE BACK/FORWARD) ---
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
            window.history.back();
          }
          // Swipe Left (Forward) - from right edge
          else if (deltaX < -SWIPE_THRESHOLD && touchStartX > window.innerWidth - EDGE_THRESHOLD) {
            window.history.forward();
          }
        }
      };

      window.addEventListener('touchstart', (handleTouchStart as unknown) as EventListener);
      window.addEventListener('touchend', (handleTouchEnd as unknown) as EventListener);

      return () => {
        listener.then(l => l.remove());
        window.removeEventListener('touchstart', (handleTouchStart as unknown) as EventListener);
        window.removeEventListener('touchend', (handleTouchEnd as unknown) as EventListener);
      };
    }
  }, []);

  // Maintenance Mode Logic:
  const isMaintenanceMode = import.meta.env.PROD && import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

  // Strict Internet Requirement for Android
  if (isAndroidOffline) {
    return <OfflineOverlay />;
  }

  return (
    <ThemeProvider>
      {isAndroid() && <UpdateModal />}
      <OfflineOverlay />
      <NetflixIntro />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/genre/:id" element={<Genre />} />
          <Route path="/series/genre/:id" element={<SeriesGenre />} />
          <Route path="/news" element={<News />} />
          {/* Catch-all route for Not Found (404) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
