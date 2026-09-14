'use client';

import { useEffect, useState } from 'react';

export default function PageLoader() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="h-8 w-8 rounded-full border-2 border-line border-t-fg animate-spin-fast" />
      {slow && (
        <p className="text-sm text-muted max-w-xs">
          Still loading — the server may be waking up. This can take up to a minute on the first request.
        </p>
      )}
    </div>
  );
}
