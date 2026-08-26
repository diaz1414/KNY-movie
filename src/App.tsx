import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Popular from './pages/Popular';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Watch from './pages/Watch';
import Genre from './pages/Genre';
import SeriesGenre from './pages/SeriesGenre';
import Maintenance from './pages/Maintenance';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import NetflixIntro from './components/NetflixIntro';
import NotFound from './pages/NotFound';
import News from './pages/News';
import PersonDetail from './pages/PersonDetail';
import LiveSports from './pages/LiveSports';
import OfflineOverlay from './components/OfflineOverlay';
import { isAndroid } from './utils/platform';
import { Network } from '@capacitor/network';
import { triggerAdOnce } from './utils/adRedirect';

import UpdateModal from './components/UpdateModal';
import AndroidBottomNav from './components/AndroidBottomNav';
import { useAndroidBack } from './hooks/useAndroidBack';

const AndroidBackHandler: React.FC = () => {
  useAndroidBack();
  return null;
};

const App: React.FC = () => {
  const [isAndroidOffline, setIsAndroidOffline] = useState(false);
  const isWatchRoute = window.location.pathname === '/watch' || window.location.pathname.startsWith('/watch/');

  useEffect(() => {
    // Trigger ad redirect once per session on app start
    triggerAdOnce();
  }, []);

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

      return () => {
        listener.then(l => l.remove());
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
      {!isWatchRoute && <OfflineOverlay />}
      {!isWatchRoute && <NetflixIntro />}
      <Router>
        {isAndroid() && <AndroidBackHandler />}
        {!isWatchRoute && <ScrollToTop />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/watch/*" element={<Watch />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/genre/:id" element={<Genre />} />
          <Route path="/series/genre/:id" element={<SeriesGenre />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/popular" element={<Popular />} />
          <Route path="/news" element={<News />} />
          <Route path="/person/:id" element={<PersonDetail />} />
          <Route path="/live-sports" element={<LiveSports />} />
          {/* Catch-all route for Not Found (404) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {isAndroid() && <AndroidBottomNav />}
      </Router>
    </ThemeProvider>
  );
};

export default App;
