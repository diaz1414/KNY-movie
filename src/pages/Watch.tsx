import React, { useMemo } from 'react';

const Watch: React.FC = () => {
  const watchSrc = useMemo(() => {
    return `/watch.html${window.location.search}${window.location.hash}`;
  }, []);

  return (
    <main className="fixed inset-0 z-[9999] bg-black">
      <iframe
        title="YKN Watch Player"
        src={watchSrc}
        className="h-dvh w-screen border-0 bg-black"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </main>
  );
};

export default Watch;
