import { apiCall } from '@/lib/api';

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
  reviewer: {
    username: string;
    full_name: string;
    avatar: string | null;
  };
}

export function getReviews(listingId: string | number) {
  return apiCall<{ reviews: Review[] }>(`/listings/${listingId}/reviews`, { auth: false });
}

export function createReview(listingId: string | number, rating: number, comment?: string) {
  return apiCall<{ success: boolean; review: Review }>(`/listings/${listingId}/reviews`, {
    method: 'POST',
    body: { rating, comment: comment || undefined },
  });
}
