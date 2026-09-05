import { apiCall } from '@/lib/api';
import {
  ListingKind,
  ListingsResponse,
  Listing,
  CreateRequestPayload,
  CreateGigPayload,
  CreateProductPayload,
} from '@/types/listing';

interface GetListingsParams {
  kind: ListingKind;
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export function getListings(params: GetListingsParams) {
  const query = new URLSearchParams({ type: params.kind });
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset) query.set('offset', String(params.offset));

  return apiCall<ListingsResponse>(`/listings?${query.toString()}`, { auth: false });
}

export function getListing(id: string | number) {
  return apiCall<Listing>(`/listings/${id}`, { auth: false });
}

export function postRequest(payload: CreateRequestPayload) {
  return apiCall<{ success: boolean; id: number }>('/listings/requests', {
    method: 'POST',
    body: payload,
  });
}

export function createGig(payload: CreateGigPayload) {
  return apiCall<{ success: boolean; id: number }>('/listings/gigs', {
    method: 'POST',
    body: payload,
  });
}

export function createProduct(payload: CreateProductPayload) {
  return apiCall<{ success: boolean; id: number }>('/listings/products', {
    method: 'POST',
    body: payload,
  });
}

export function getMyListings() {
  return apiCall<ListingsResponse>('/listings/mine');
}

export async function uploadListingImages(files: File[]): Promise<string[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('creet_token') : null;

  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));

  const res = await fetch(`${API_BASE}/listings/upload-images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Could not upload images');
  }
  return data.urls as string[];
}

export function updateListing(id: number, payload: Partial<CreateProductPayload & CreateRequestPayload>) {
  return apiCall<Listing>(`/listings/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteListing(id: number) {
  return apiCall<{ success: boolean }>(`/listings/${id}`, {
    method: 'DELETE',
  });
}

export function markSold(id: number) {
  return apiCall<Listing>(`/listings/${id}/mark-sold`, {
    method: 'POST',
  });
}
