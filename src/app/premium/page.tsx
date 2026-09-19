'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { initiatePremium, verifyPremium, getPremiumQuote, PremiumPlan } from '@/lib/payments';
import { currencySymbol } from '@/lib/currency';
import { readCachedQuote, writeCachedQuote } from '@/lib/premiumQuoteCache';

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

const PLAN_META: { id: PremiumPlan; label: string; note?: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'three_months', label: '3 Months', note: 'Save vs monthly' },
  { id: 'yearly', label: 'Yearly', note: 'Best value' },
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
  const [currency, setCurrency] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<PremiumPlan, number> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (document.getElementById('flutterwave-script')) return;
    const script = document.createElement('script');
    script.id = 'flutterwave-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const cached = readCachedQuote();
    if (cached) {
      setCurrency(cached.currency);
      setAmounts(cached.amounts);
    }

    getPremiumQuote()
      .then((res) => {
        setCurrency(res.currency);
        setAmounts(res.amounts);
        writeCachedQuote(res.currency, res.amounts);
      })
      .catch(() => {
        // Quote fetch failed — if we had a cached quote it's still showing,
        // otherwise currency/amounts stay null and the button stays disabled
        // rather than showing a guessed currency.
      });
  }, []);

  const quoteLoaded = currency !== null && amounts !== null;
  const symbol = currency ? currencySymbol(currency) : '';

  function formatAmount(amount: number) {
    return amount.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

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
    <main className="min-h-screen bg-black">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line safe-top">
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
          {PLAN_META.map((plan) => {
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
                <div className="text-xs text-fg/60 mt-1 h-4 flex items-center justify-center">
                  {quoteLoaded ? (
                    <span className="animate-fade-in-up opacity-0" style={{ animationDuration: '250ms' }}>
                      {symbol}{formatAmount(amounts![plan.id])}
                    </span>
                  ) : (
                    <span className="h-3 w-12 rounded bg-fg/10 animate-pulse" />
                  )}
                </div>
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
          disabled={loading || !quoteLoaded}
          className="w-full bg-blue hover:bg-blue-deep disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-3 transition-colors"
        >
          {loading ? (
            'Processing…'
          ) : quoteLoaded ? (
            `Upgrade — ${symbol}${formatAmount(amounts![selected])}`
          ) : (
            <span className="inline-flex items-center gap-2">
              Upgrade
              <span className="h-3 w-14 rounded bg-white/20 animate-pulse" />
            </span>
          )}
        </button>
      </div>
    </main>
  );
}
