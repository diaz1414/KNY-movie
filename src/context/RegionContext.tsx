import React, { createContext, useContext, useEffect, useState } from 'react';

interface GeoData {
  country: string;
  city: string;
  region: string;
}

interface RegionContextType {
  regionData: GeoData | null;
  countryCode: string;
  isLoading: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

// Helper to get cookie value
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  return null;
};

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [regionData, setRegionData] = useState<GeoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Cek Subdomain (Prioritas Utama untuk Manual Override)
    const hostname = window.location.hostname;
    let detectedCountry = '';
    
    if (hostname.startsWith('sg.')) detectedCountry = 'SG';
    else if (hostname.startsWith('id.')) detectedCountry = 'ID';

    // 2. Cek Cookie (Geo Data dari Middleware)
    const rawData = getCookie('user-region-data');
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        // Jika subdomain tidak ada, gunakan data dari cookie
        if (detectedCountry) {
          setRegionData({ ...parsed, country: detectedCountry });
        } else {
          setRegionData(parsed);
        }
      } catch (e) {
        console.error('Failed to parse region data', e);
      }
    } else if (detectedCountry) {
      // Fallback jika tidak ada cookie tapi ada subdomain
      setRegionData({ country: detectedCountry, city: 'Unknown', region: 'Unknown' });
    }
    
    setIsLoading(false);
  }, []);

  // Default to US if not detected (e.g. local dev)
  const countryCode = regionData?.country || 'US';

  return (
    <RegionContext.Provider value={{ regionData, countryCode, isLoading }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) throw new Error('useRegion must be used within RegionProvider');
  return context;
};
