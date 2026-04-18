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
