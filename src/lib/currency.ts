export const COUNTRY_CURRENCY: Record<string, string> = {
  Nigeria: 'NGN',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  Ghana: 'GHS',
  Kenya: 'KES',
  'South Africa': 'ZAR',
  Canada: 'CAD',
  Germany: 'EUR',
  France: 'EUR',
  India: 'INR',
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
  CAD: 'C$',
  EUR: '€',
  INR: '₹',
};

export function localCurrencyForCountry(country?: string | null): string {
  if (!country) return 'NGN';
  return COUNTRY_CURRENCY[country] || 'USD';
}

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}
