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
