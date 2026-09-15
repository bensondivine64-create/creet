import { apiCall } from '@/lib/api';
import { Comment, CommentsResponse } from '@/types/comment';

export function getComments(listingId: string | number, params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.offset) q.set('offset', String(params.offset));
  const qs = q.toString();
  return apiCall<CommentsResponse>(`/listings/${listingId}/comments${qs ? `?${qs}` : ''}`, { auth: false });
}

export function postComment(listingId: string | number, content: string) {
  return apiCall<{ success: boolean; comment: Comment }>(`/listings/${listingId}/comments`, {
    method: 'POST',
    body: { content },
  });
}
