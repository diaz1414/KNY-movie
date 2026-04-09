import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Paksa layar ke posisi paling atas setiap kali URL berubah
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Biar efek nanjaknya halus, Bos
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
