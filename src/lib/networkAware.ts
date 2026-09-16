interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

// True when it's reasonable to do proactive background work (prefetching,
// eager revalidation). False on data-saver mode or a slow connection, where
// the current page's own requests should have full priority.
export function shouldPrefetch(): boolean {
  const conn = getConnection();
  if (!conn) return true; // API unsupported (e.g. Safari) — assume normal connection
  if (conn.saveData) return false;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return false;
  return true;
}
