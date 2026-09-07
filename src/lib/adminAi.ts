import { apiCall } from '@/lib/api';

export interface PendingAction {
  action: string;
  target_id: number;
}

export interface AiReply {
  reply: string;
  action_taken: string | null;
  error: string | null;
  pending_action: PendingAction | null;
}

export function sendAiCommand(message: string) {
  return apiCall<AiReply>('/admin/ai-assistant', {
    method: 'POST',
    body: { message },
  });
}

export function confirmAiAction(action: string, target_id: number) {
  return apiCall<{ success: boolean; error: string | null }>('/admin/ai-assistant/confirm', {
    method: 'POST',
    body: { action, target_id },
  });
}
