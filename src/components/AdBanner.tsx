import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  id: string;
  format: 'iframe' | 'native';
  width?: number;
  height?: number;
  key?: string;
  scriptUrl?: string; // For native banner
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ id, format, width, height, key, scriptUrl, className }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    if (format === 'iframe' && key) {
      // Logic for standard banners (320x50, 728x90, etc.)
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        atOptions = {
          'key' : '${key}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `https://www.highperformanceformat.com/${key}/invoke.js`;

      adRef.current.appendChild(script);
      adRef.current.appendChild(invokeScript);
    } else if (format === 'native' && scriptUrl) {
      // Logic for Native Banners
      const script = document.createElement('script');
      script.async = true;
      script.dataset.cfasync = 'false';
      script.src = scriptUrl;
      
      adRef.current.appendChild(script);
    }

    return () => {
      // Cleanup if necessary (usually scripts append things to document, hard to clean perfectly but we clear the container)
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [id, format, width, height, key, scriptUrl]);

  return (
    <div 
      id={id} 
      ref={adRef} 
      className={className}
    />
  );
};

export default AdBanner;
