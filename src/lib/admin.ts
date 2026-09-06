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

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  is_admin: boolean;
  is_verified: boolean;
  account_status: 'active' | 'suspended';
  created_at: string;
}

export function getAdminUsers(params: { search?: string; role?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  if (params.status) q.set('status', params.status);
  return apiCall<{ users: AdminUser[]; total: number }>(`/admin/users?${q.toString()}`);
}

export function verifyUser(id: number) {
  return apiCall(`/admin/users/${id}/verify`, { method: 'POST' });
}
export function unverifyUser(id: number) {
  return apiCall(`/admin/users/${id}/unverify`, { method: 'POST' });
}
export function suspendUser(id: number) {
  return apiCall(`/admin/users/${id}/suspend`, { method: 'POST' });
}
export function activateUser(id: number) {
  return apiCall(`/admin/users/${id}/activate`, { method: 'POST' });
}
export function makeAdmin(id: number) {
  return apiCall(`/admin/users/${id}/make-admin`, { method: 'POST' });
}
export function removeAdmin(id: number) {
  return apiCall(`/admin/users/${id}/remove-admin`, { method: 'POST' });
}

export function getAdminListings(params: { search?: string; kind?: string }) {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.kind) q.set('kind', params.kind);
  return apiCall<{ listings: import('@/types/listing').Listing[]; total: number }>(`/admin/listings?${q.toString()}`);
}

export function deleteListingAdmin(id: number) {
  return apiCall(`/admin/listings/${id}`, { method: 'DELETE' });
}

export interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  is_admin: boolean;
  is_verified: boolean;
  account_status: 'active' | 'suspended';
  created_at: string;
}

export function getAdminUsers(params: { search?: string; role?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.role) q.set('role', params.role);
  if (params.status) q.set('status', params.status);
  return apiCall<{ users: AdminUser[]; total: number }>(`/admin/users?${q.toString()}`);
}

export function verifyUser(id: number) {
  return apiCall(`/admin/users/${id}/verify`, { method: 'POST' });
}
export function unverifyUser(id: number) {
  return apiCall(`/admin/users/${id}/unverify`, { method: 'POST' });
}
export function suspendUser(id: number) {
  return apiCall(`/admin/users/${id}/suspend`, { method: 'POST' });
}
export function activateUser(id: number) {
  return apiCall(`/admin/users/${id}/activate`, { method: 'POST' });
}
export function makeAdmin(id: number) {
  return apiCall(`/admin/users/${id}/make-admin`, { method: 'POST' });
}
export function removeAdmin(id: number) {
  return apiCall(`/admin/users/${id}/remove-admin`, { method: 'POST' });
}

export function getAdminListings(params: { search?: string; kind?: string }) {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.kind) q.set('kind', params.kind);
  return apiCall<{ listings: import('@/types/listing').Listing[]; total: number }>(`/admin/listings?${q.toString()}`);
}

export function deleteListingAdmin(id: number) {
  return apiCall(`/admin/listings/${id}`, { method: 'DELETE' });
}
