'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { initiatePremium, verifyPremium, PremiumPlan } from '@/lib/payments';

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

const PLANS: { id: PremiumPlan; label: string; price: number; note?: string }[] = [
  { id: 'monthly', label: 'Monthly', price: 2000 },
  { id: 'three_months', label: '3 Months', price: 5500, note: 'Save vs monthly' },
  { id: 'yearly', label: 'Yearly', price: 20000, note: 'Best value' },
];

const perks = [
  'Priority placement in browse and search results',
  'Premium badge on your profile and listings',
  'Access to detailed performance insights',
  'Priority support',
];

export default function PremiumPage() {
  const [selected, setSelected] = useState<PremiumPlan>('monthly');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (document.getElementById('flutterwave-script')) return;
    const script = document.createElement('script');
    script.id = 'flutterwave-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    document.body.appendChild(script);
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const init = await initiatePremium(selected);
      if (!window.FlutterwaveCheckout) {
        alert('Payment is still loading, please try again in a moment.');
        setLoading(false);
        return;
      }
      window.FlutterwaveCheckout({
        public_key: init.public_key,
        tx_ref: init.tx_ref,
        amount: init.amount,
        currency: init.currency,
        payment_options: 'card,banktransfer,ussd',
        customer: init.customer,
        customizations: {
          title: 'CREET Premium',
          description: `CREET Premium — ${selected.replace('_', ' ')}`,
        },
        callback: async () => {
          try {
            const result = await verifyPremium(init.tx_ref);
            if (result.is_premium) {
              alert('Premium activated!');
              router.push('/profile');
            } else {
              alert('Payment could not be verified. Contact support if you were charged.');
            }
          } catch {
            alert('Payment could not be verified. Contact support if you were charged.');
          } finally {
            setLoading(false);
          }
        },
        onclose: () => {
          setLoading(false);
        },
      });
    } catch {
      alert('Could not start payment. Please try again.');
      setLoading(false);
    }
  }

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
        <h1 className="font-display text-2xl font-bold text-fg mb-2">Stand out on CREET</h1>
        <p className="text-sm text-fg/50 mb-6">
          Premium gives buyers, freelancers, and vendors extra visibility and tools.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-8">
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`rounded-lg border py-3 px-2 text-center transition-colors ${
                  active ? 'border-blue bg-blue/10' : 'border-line'
                }`}
              >
                <div className={`text-sm font-semibold ${active ? 'text-blue' : 'text-fg'}`}>{plan.label}</div>
                <div className="text-xs text-fg/60 mt-1">₦{plan.price.toLocaleString()}</div>
                {plan.note && <div className="text-[10px] text-fg/40 mt-1">{plan.note}</div>}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 mb-8">
          {perks.map((perk) => (
            <div key={perk} className="flex items-start gap-2.5">
              <span className="text-blue mt-0.5">✓</span>
              <span className="text-sm text-fg/70">{perk}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-3 transition-colors"
        >
          {loading ? 'Processing…' : `Upgrade — ₦${PLANS.find((p) => p.id === selected)!.price.toLocaleString()}`}
        </button>
      </div>
    </main>
  );
}
