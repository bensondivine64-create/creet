import { apiCall } from '@/lib/api';
import { Listing } from '@/types/listing';

export type ConnectionStatus = 'none' | 'pending_sent' | 'pending_received' | 'connected';

export interface ConnectionUser {
  id: number;
  username: string;
  full_name: string;
  avatar?: string | null;
  role: string;
  is_verified: boolean;
  connection_id: number;
}

export function getConnectionStatus(userId: number) {
  return apiCall<{ status: ConnectionStatus; connection_id?: number }>(`/connections/status/${userId}`);
}

export function sendConnectionRequest(userId: number) {
  return apiCall<{ success: boolean; connection_id: number }>(`/connections/request/${userId}`, { method: 'POST' });
}

export function acceptConnection(connectionId: number) {
  return apiCall<{ success: boolean }>(`/connections/${connectionId}/accept`, { method: 'POST' });
}

export function declineConnection(connectionId: number) {
  return apiCall<{ success: boolean }>(`/connections/${connectionId}/decline`, { method: 'POST' });
}

export function getMyConnections() {
  return apiCall<{ connections: ConnectionUser[]; pending_received: ConnectionUser[] }>('/connections/mine');
}

export function getConnectionsFeed() {
  return apiCall<{ listings: Listing[] }>('/connections/feed');
}
