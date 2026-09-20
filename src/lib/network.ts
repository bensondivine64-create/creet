import { apiCall } from '@/lib/api';

export interface PostAuthor {
  username: string;
  full_name: string;
  avatar?: string | null;
  role: string;
  verified: boolean;
}

export interface NetworkPost {
  id: number;
  content: string;
  image_url?: string | null;
  created_at: string;
  author: PostAuthor;
}

export interface NetworkFeedResponse {
  posts: NetworkPost[];
  total: number;
}

export function followUser(userId: number) {
  return apiCall<{ success: boolean; following: boolean }>(`/follow/${userId}`, { method: 'POST' });
}

export function unfollowUser(userId: number) {
  return apiCall<{ success: boolean; following: boolean }>(`/follow/${userId}`, { method: 'DELETE' });
}

export function getFollowStatus(userId: number) {
  return apiCall<{ following: boolean; follower_count: number; following_count: number }>(`/follow/status/${userId}`);
}

export function createPost(content: string, imageUrl?: string) {
  return apiCall<{ success: boolean; post: NetworkPost }>('/posts', {
    method: 'POST',
    body: { content, image_url: imageUrl },
  });
}

export function deletePost(postId: number) {
  return apiCall<{ success: boolean }>(`/posts/${postId}`, { method: 'DELETE' });
}

export function getNetworkFeed(params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.offset) q.set('offset', String(params.offset));
  const qs = q.toString();
  return apiCall<NetworkFeedResponse>(`/posts/feed${qs ? `?${qs}` : ''}`);
}

export interface SuggestedUser {
  id: number;
  username: string;
  full_name: string;
  avatar?: string | null;
  role: string;
  short_bio?: string | null;
  verified: boolean;
}

export function getWhoToFollow(limit = 10) {
  return apiCall<{ users: SuggestedUser[] }>(`/who-to-follow?limit=${limit}`);
}

export function getUserPosts(username: string) {
  return apiCall<{ posts: NetworkPost[] }>(`/posts/user/${username}`, { auth: false });
}
