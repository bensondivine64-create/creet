import { apiCall } from '@/lib/api';
import { ConversationsResponse, MessagesResponse, Message } from '@/types/message';

export function getConversations() {
  return apiCall<ConversationsResponse>('/conversations');
}

export function getMessages(conversationId: string | number) {
  return apiCall<MessagesResponse>(`/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId: string | number, content: string) {
  return apiCall<{ success: boolean; message: Message }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { content },
  });
}

export function startConversation(listingId: number) {
  return apiCall<{ conversation_id: number }>('/conversations', {
    method: 'POST',
    body: { listing_id: listingId },
  });
}
