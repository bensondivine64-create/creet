export type NotificationType = 'reply' | 'announcement' | 'system';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  link?: string | null;
  created_at: string;
  actor?: {
    username: string;
    full_name: string;
    avatar: string | null;
  } | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}
