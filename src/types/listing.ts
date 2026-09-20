export type ListingKind = 'gig' | 'product' | 'request';

interface ListingSeller {
  username: string;
  full_name: string;
  avatar?: string | null;
  verified: boolean;
}

interface ListingBase {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  seller: ListingSeller;
  comment_count?: number;
  created_at: string;
}

export interface Gig extends ListingBase {
  kind: 'gig';
  delivery_days: number;
}

export interface Product extends ListingBase {
  kind: 'product';
  condition: 'new' | 'used';
  stock: number;
  sold_at?: string | null;
}

export interface BuyerRequest extends ListingBase {
  kind: 'request';
  deadline?: string | null;
}

export type Listing = Gig | Product | BuyerRequest;

export interface ListingsResponse {
  listings: Listing[];
  total: number;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  currency?: string;
  deadline?: string;
  images?: string[];
}

export interface CreateGigPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  currency?: string;
  delivery_days: number;
  images?: string[];
}

export interface CreateProductPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  currency?: string;
  condition: 'new' | 'used';
  stock: number;
  images?: string[];
}
