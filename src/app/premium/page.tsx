'use client';

import Link from 'next/link';

const perks = [
  'Priority placement in browse and search results',
  'Premium badge on your profile and listings',
  'Access to detailed performance insights',
  'Priority support',
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/profile" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Premium</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-fg mb-2">
          Stand out on CREET
        </h1>
        <p className="text-sm text-fg/50 mb-6">
          Premium gives buyers, freelancers, and vendors extra visibility and tools.
        </p>

        <div className="space-y-3 mb-8">
          {perks.map((perk) => (
            <div key={perk} className="flex items-start gap-2.5">
              <span className="text-blue mt-0.5">✓</span>
              <span className="text-sm text-fg/70">{perk}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => alert('Payment for Premium is coming soon.')}
          className="w-full bg-blue hover:bg-blue-deep text-white text-sm font-semibold rounded-lg py-3 transition-colors"
        >
          Upgrade to Premium
        </button>
      </div>
    </main>
  );
}
