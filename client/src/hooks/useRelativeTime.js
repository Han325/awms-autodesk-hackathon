import { useState, useEffect } from 'react';

export function useRelativeTime(isoString) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    if (!isoString) {
      setRelativeTime('N/A');
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const then = new Date(isoString);
      const diffMs = now - then;
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffSeconds < 5) {
        setRelativeTime('Just now');
      } else if (diffSeconds < 60) {
        setRelativeTime(`${diffSeconds}s ago`);
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        setRelativeTime(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        setRelativeTime(`${hours}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [isoString]);

  return relativeTime;
}
