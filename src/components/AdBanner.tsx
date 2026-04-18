import React from 'react';
import { isAndroid } from '../utils/platform';

interface AdBannerProps {
  id: string;
  format: 'iframe';
  height: number;
  width: number;
  adKey: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ height, width, adKey }) => {
  // ADSTERRA BLOCKED TEMPORARILY
  const isAdsBlocked = true;
  if (isAdsBlocked || isAndroid()) {
    return null;
  }

  // We use srcDoc to create an isolated environment for the ad script.
  // This prevents scripts from clashing and works much better in React.
  const adContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="flex justify-center items-center my-8 overflow-hidden min-h-[50px] w-full">
      <iframe
        title={`ad-${adKey}`}
        srcDoc={adContent}
        width={width}
        height={height}
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
      />
    </div>
  );
};

export default AdBanner;
