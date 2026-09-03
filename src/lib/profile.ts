import { apiCall } from '@/lib/api';
import { User, UpdateProfilePayload } from '@/types/auth';

export function updateProfile(payload: UpdateProfilePayload) {
  return apiCall<User>('/profile', {
    method: 'PUT',
    body: payload,
  });
}
