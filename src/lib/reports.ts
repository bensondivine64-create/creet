import { apiCall } from '@/lib/api';

export function createReport(payload: { target_type: 'listing' | 'user'; target_id: number; reason: string; description?: string }) {
  return apiCall<{ success: boolean; id: number }>('/reports', { method: 'POST', body: payload });
}

export interface AdminReport {
  id: number;
  reporter: string;
  reporter_username: string | null;
  target_type: string;
  target_id: number;
  target_label: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

export function getAdminReports(status?: string) {
  const q = status ? `?status=${status}` : '';
  return apiCall<{ reports: AdminReport[]; total: number }>(`/reports/admin${q}`);
}

export function resolveReport(id: number) {
  return apiCall(`/reports/admin/${id}/resolve`, { method: 'POST' });
}
