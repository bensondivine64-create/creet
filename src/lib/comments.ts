import { apiCall } from '@/lib/api';
import { Comment, CommentsResponse } from '@/types/comment';

export function getComments(listingId: string | number) {
  return apiCall<CommentsResponse>(`/listings/${listingId}/comments`, { auth: false });
}

export function postComment(listingId: string | number, content: string) {
  return apiCall<{ success: boolean; comment: Comment }>(`/listings/${listingId}/comments`, {
    method: 'POST',
    body: { content },
  });
}
