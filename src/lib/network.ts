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
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  author: PostAuthor;
}

export interface PostComment {
  id: number;
  content: string;
  created_at: string;
  author: {
    username: string;
    full_name: string;
    avatar?: string | null;
    verified: boolean;
  };
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

export async function uploadPostImage(file: File): Promise<string> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('creet_token') : null;
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/posts/upload-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Could not upload image');
  }
  return data.url as string;
}

export function likePost(postId: number) {
  return apiCall<{ success: boolean; liked: boolean; like_count: number }>(`/posts/${postId}/like`, { method: 'POST' });
}

export function unlikePost(postId: number) {
  return apiCall<{ success: boolean; liked: boolean; like_count: number }>(`/posts/${postId}/like`, { method: 'DELETE' });
}

export function getPostComments(postId: number) {
  return apiCall<{ comments: PostComment[] }>(`/posts/${postId}/comments`, { auth: false });
}

export function addPostComment(postId: number, content: string) {
  return apiCall<{ success: boolean; comment: PostComment }>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: { content },
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
