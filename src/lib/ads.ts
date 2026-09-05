import { apiCall } from '@/lib/api';

export interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_url?: string | null;
}

export function getAds() {
  return apiCall<{ ads: Ad[] }>('/ads', { auth: false });
}
