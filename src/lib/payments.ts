import { apiCall } from '@/lib/api';

export type PremiumPlan = 'monthly' | 'three_months' | 'yearly';

export interface InitiatePremiumResponse {
  tx_ref: string;
  amount: number;
  currency: string;
  public_key: string;
  customer: { email: string; name: string };
}

export function initiatePremium(plan: PremiumPlan) {
  return apiCall<InitiatePremiumResponse>('/payments/premium/initiate', {
    method: 'POST',
    body: { plan },
  });
}

export interface VerifyPremiumResponse {
  is_premium: boolean;
  premium_expires: string | null;
}

export function verifyPremium(tx_ref: string) {
  return apiCall<VerifyPremiumResponse>('/payments/premium/verify', {
    method: 'POST',
    body: { tx_ref },
  });
}
