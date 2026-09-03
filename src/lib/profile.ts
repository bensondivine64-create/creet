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
