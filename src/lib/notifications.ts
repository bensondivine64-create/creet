import { apiCall } from '@/lib/api';
import { NotificationsResponse } from '@/types/notification';

export function getNotifications() {
  return apiCall<NotificationsResponse>('/notifications');
}

export function markNotificationRead(id: number) {
  return apiCall<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' });
}

export function markAllNotificationsRead() {
  return apiCall<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
}
