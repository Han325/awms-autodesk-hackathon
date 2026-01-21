import { useState, useEffect, useCallback } from 'react';

export function usePolling(fetchFn, interval = 3000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const poll = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    async function doPoll() {
      await poll();
      if (mounted) {
        timeoutId = setTimeout(doPoll, interval);
      }
    }

    doPoll();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [poll, interval, refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return { data, loading, error, refresh };
}
