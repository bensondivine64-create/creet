import { apiCall } from '@/lib/api';
import { User, UpdateProfilePayload } from '@/types/auth';

export function updateProfile(payload: UpdateProfilePayload) {
  return apiCall<User>('/profile', {
    method: 'PUT',
    body: payload,
  });
}

export interface PublicProfile {
  id: number;
  username: string;
  full_name: string;
  role: string;
  avatar?: string | null;
  cover_photo?: string | null;
  bio?: string | null;
  location?: string | null;
  categories: string[];
  is_verified: boolean;
  is_premium: boolean;
  verified_badge: boolean;
  connection_count: number;
  created_at: string;
  listings: import('@/types/listing').Listing[];
}

export function getPublicProfile(username: string) {
  return apiCall<PublicProfile>(`/profile/${username}`, { auth: false });
}

async function uploadImageField(url: string, fieldName: string, file: File): Promise<User> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('creet_token') : null;

  const formData = new FormData();
  formData.append(fieldName, file);

  const res = await fetch(`${API_BASE}${url}`, {
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

export function uploadAvatar(file: File): Promise<User> {
  return uploadImageField('/profile/avatar', 'avatar', file);
}

export function uploadCoverPhoto(file: File): Promise<User> {
  return uploadImageField('/profile/cover', 'cover', file);
}

export interface DirectoryProfile {
  id: number;
  username: string;
  full_name: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  verified_badge: boolean;
}

export function getProfileDirectory(role: 'freelancer' | 'vendor' | 'buyer', limit = 10) {
  return apiCall<{ profiles: DirectoryProfile[] }>(`/profile/directory/${role}?limit=${limit}`, { auth: false });
}
