import { apiCall } from '@/lib/api';
import { User, UpdateProfilePayload } from '@/types/auth';

export function updateProfile(payload: UpdateProfilePayload) {
  return apiCall<User>('/profile', {
    method: 'PUT',
    body: payload,
  });
}

export interface PublicProfile {
  username: string;
  full_name: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  categories: string[];
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  listings: import('@/types/listing').Listing[];
}

export function getPublicProfile(username: string) {
  return apiCall<PublicProfile>(`/profile/${username}`, { auth: false });
}

export async function uploadAvatar(file: File): Promise<User> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('creet_token') : null;

  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API_BASE}/profile/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Could not upload photo');
  }
  return data as User;
}
