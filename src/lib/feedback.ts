import { apiCall } from '@/lib/api';

export function submitFeedback(rating: number, comment: string) {
  return apiCall<{ success: boolean }>('/feedback', {
    method: 'POST',
    body: { rating, comment },
  });
}
