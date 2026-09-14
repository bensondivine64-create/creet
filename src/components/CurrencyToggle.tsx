'use client';

import { currencySymbol } from '@/lib/currency';

interface CurrencyToggleProps {
  localCurrency: string;
  value: string;
  onChange: (currency: string) => void;
}

export default function CurrencyToggle({ localCurrency, value, onChange }: CurrencyToggleProps) {
  if (localCurrency === 'USD') {
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-fg/70 mb-1.5">Currency</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(localCurrency)}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            value === localCurrency ? 'bg-blue text-black border-blue' : 'bg-black border-line text-muted'
          }`}
        >
          {currencySymbol(localCurrency)} {localCurrency}
        </button>
        <button
          type="button"
          onClick={() => onChange('USD')}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            value === 'USD' ? 'bg-blue text-black border-blue' : 'bg-black border-line text-muted'
          }`}
        >
          $ USD
        </button>
      </div>
    </div>
  );
}
