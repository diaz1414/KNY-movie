import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Hanya scroll ke atas kalau navigasi BARU (PUSH), 
    // kalau navigasi BACK/FORWARD (POP), biarkan browser yang atur posisinya.
    if (navType !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Instant lebih akurat buat navigasi antar page
      });
    }
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
