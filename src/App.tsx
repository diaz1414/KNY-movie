import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Genre from './pages/Genre';
import SeriesGenre from './pages/SeriesGenre';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import NetflixIntro from './components/NetflixIntro';

const App: React.FC = () => {
  return (
    <ThemeProvider>
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
