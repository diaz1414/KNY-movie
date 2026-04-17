import React from 'react';
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

const App: React.FC = () => {
  // Maintenance Mode Logic:
  // Only active in Production (e.g. Vercel) AND if the Env Var is set to 'true'
  // This allows you to keep working locally even if maintenance is on for users.
  const isMaintenanceMode = import.meta.env.PROD && import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    return <Maintenance />;
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
