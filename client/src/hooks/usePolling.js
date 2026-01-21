import { useState, useEffect } from 'react';

export function usePolling(fetchFn, interval = 3000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    async function poll() {
      try {
        const result = await fetchFn();
        if (mounted) {
          setData(result);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }

      if (mounted) {
        timeoutId = setTimeout(poll, interval);
      }
    }

    poll();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchFn, interval]);

  return { data, loading, error };
}
