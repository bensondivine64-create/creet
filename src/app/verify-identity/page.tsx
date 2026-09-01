'use client';

import Link from 'next/link';

export default function VerifyIdentityPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/profile" className="text-sm text-ink/50 hover:text-ink transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-ink">Get Verified</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-ink mb-2">
          Build trust on CREET
        </h1>
        <p className="text-sm text-ink/60 leading-relaxed mb-6">
          Verified accounts get a badge shown next to their name across the
          platform, helping buyers and sellers trust who they&apos;re dealing with.
        </p>
        <button
          onClick={() => alert('Identity verification is coming soon.')}
          className="w-full bg-blue hover:bg-blue-deep text-white text-sm font-semibold rounded-lg py-3 transition-colors"
        >
          Start verification
        </button>
      </div>
    </main>
  );
}
