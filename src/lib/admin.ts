import { apiCall } from '@/lib/api';

export interface AdminStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  total_listings: number;
  total_reports: number;
  pending_reports: number;
  recent_activity: { type: string; text: string; created_at: string | null }[];
}

export function getAdminStats() {
  return apiCall<AdminStats>('/admin/stats');
}
