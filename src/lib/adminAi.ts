import { apiCall } from '@/lib/api';

export interface PendingAction {
  action: string;
  target_id: number;
  message?: string | null;
}

export interface AiReply {
  reply: string;
  action_taken: string | null;
  error: string | null;
  pending_action: PendingAction | null;
}

export interface HistoryItem {
  role: 'admin' | 'ai';
  text: string;
}

export function sendAiCommand(message: string, history: HistoryItem[]) {
  return apiCall<AiReply>('/admin/ai-assistant', {
    method: 'POST',
    body: { message, history },
  });
}

export function confirmAiAction(action: string, target_id: number, message?: string | null) {
  return apiCall<{ success: boolean; error: string | null }>('/admin/ai-assistant/confirm', {
    method: 'POST',
    body: { action, target_id, message },
  });
}
