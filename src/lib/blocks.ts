import { apiCall } from '@/lib/api';

export interface BlockedUser {
  id: number;
  username: string;
  full_name: string;
  avatar: string | null;
}

export function getBlockedUsers() {
  return apiCall<{ blocked: BlockedUser[] }>('/blocks');
}

export function blockUser(userId: number) {
  return apiCall<{ success: boolean }>(`/blocks/${userId}`, { method: 'POST' });
}

export function unblockUser(userId: number) {
  return apiCall<{ success: boolean }>(`/blocks/${userId}`, { method: 'DELETE' });
}

export function getBlockStatus(userId: number) {
  return apiCall<{ i_blocked_them: boolean; they_blocked_me: boolean }>(`/blocks/${userId}/status`);
}
