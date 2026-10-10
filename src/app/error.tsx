'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-8 text-center">
      <div className="h-14 w-14 rounded-full bg-mist border border-line flex items-center justify-center text-fg/50 mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
        </svg>
      </div>
      <h1 className="font-display text-xl font-bold text-fg mb-1.5">Something went wrong</h1>
      <p className="text-sm text-muted max-w-xs mb-6">This page hit a problem. Try again, or head back to browse.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="ripple btn-elevated bg-blue text-black text-sm font-semibold rounded-xl px-6 py-3 active:scale-[0.97] transition-transform">
          Try again
        </button>
        <Link href="/browse" className="ripple border border-line text-fg text-sm font-semibold rounded-xl px-6 py-3 active:scale-[0.97] transition-transform">
          Go to browse
        </Link>
      </div>
    </main>
  );
}
