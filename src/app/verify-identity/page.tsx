'use client';

import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

export default function VerifyIdentityPage() {
  const { showToast } = useToast();
  return (
    <main className="min-h-screen bg-paper">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line safe-top">
        <Link href="/profile" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Get Verified</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-fg mb-2">
          Build trust on CREET
        </h1>
        <p className="text-sm text-fg/60 leading-relaxed mb-8">
          Verified accounts get a badge shown next to their name across the
          platform, helping buyers and sellers trust who they&apos;re dealing with.
        </p>
        <button
          onClick={() => showToast('Identity verification is coming soon', 'info')}
          className="ripple btn-elevated w-full bg-blue hover:bg-blue-deep active:scale-[0.98] text-black text-sm font-semibold rounded-xl py-3.5 transition-colors"
        >
          Start verification
        </button>
      </div>
    </main>
  );
}
