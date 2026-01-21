import { useState, useEffect } from 'react';

export function useTimestamp(isoString) {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    if (!isoString) {
      setDisplayTime('N/A');
      return;
    }

    const updateTime = () => {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffSeconds = Math.floor(diffMs / 1000);

      // Format the actual timestamp
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });

      // Add relative time (skip "Just now")
      let relativeStr = '';
      if (diffSeconds < 5) {
        // Don't show "Just now", just show the timestamp
        setDisplayTime(timeStr);
        return;
      } else if (diffSeconds < 60) {
        relativeStr = `${diffSeconds}s ago`;
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        relativeStr = `${minutes}m ago`;
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        relativeStr = `${hours}h ago`;
      }

      setDisplayTime(`${timeStr} (${relativeStr})`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [isoString]);

  return displayTime;
}
