import { apiCall } from '@/lib/api';
import { User } from '@/types/auth';

export function updateNotificationPrefs(payload: {
  notify_messages?: boolean;
  notify_announcements?: boolean;
  notify_listing_activity?: boolean;
}) {
  return apiCall<User>('/auth/me/notifications', { method: 'PUT', body: payload });
}

export function changePassword(current_password: string, new_password: string) {
  return apiCall<{ success: boolean }>('/auth/me/change-password', {
    method: 'POST',
    body: { current_password, new_password },
  });
}

export function deleteAccount(password: string) {
  return apiCall<{ success: boolean }>('/auth/me/delete-account', {
    method: 'POST',
    body: { password },
  });
}
