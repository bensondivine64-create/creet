import { apiCall } from '@/lib/api';

export type SupportSenderType = 'user' | 'ai' | 'agent' | 'system';
export type SupportStatus = 'ai' | 'human' | 'awaiting_escalation_confirm' | 'resolved';

export interface SupportMessage {
  id: number;
  sender_type: SupportSenderType;
  content: string;
  created_at: string;
}

export interface SupportConversationResponse {
  conversation_id: number;
  status: SupportStatus;
  messages: SupportMessage[];
  ticket: { id: number; status: string; category: string | null } | null;
}

export interface SendMessageResponse {
  conversation_id: number;
  status: SupportStatus;
  reply: string | null;
  ticket_id?: number;
}

export function getSupportConversation() {
  return apiCall<SupportConversationResponse>('/support/conversation');
}

export function sendSupportMessage(message: string) {
  return apiCall<SendMessageResponse>('/support/message', {
    method: 'POST',
    body: { message },
  });
}
