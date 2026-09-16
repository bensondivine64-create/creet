import { ConnectionUser } from '@/lib/connections';
import { Listing } from '@/types/listing';

interface ConnectionsCacheData {
  connections: ConnectionUser[];
  pending: ConnectionUser[];
  feed: Listing[];
}

let cached: ConnectionsCacheData | null = null;

export function getCachedConnections(): ConnectionsCacheData | null {
  return cached;
}

export function setCachedConnections(data: ConnectionsCacheData) {
  cached = data;
}

export function clearConnectionsCache() {
  cached = null;
}
