import { apiCall } from '@/lib/api';
import { ConversationsResponse, MessagesResponse, Message } from '@/types/message';

export function getConversations(params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.offset) q.set('offset', String(params.offset));
  const qs = q.toString();
  return apiCall<ConversationsResponse>(`/conversations${qs ? `?${qs}` : ''}`);
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

export async function sendMessageImage(conversationId: string | number, file: File) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('creet_token') : null;
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Could not send image');
  }
  return data as { success: boolean; message: Message };
}

export function startConversation(listingId: number) {
  return apiCall<{ conversation_id: number }>('/conversations', {
    method: 'POST',
    body: { listing_id: listingId },
  });
}
