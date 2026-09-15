export type Role = 'buyer' | 'freelancer' | 'vendor';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: Role;
  is_admin: boolean;
  is_verified: boolean;
  is_premium: boolean;
  verified_badge: boolean;
  avatar?: string | null;
  cover_photo?: string | null;
  bio?: string | null;
  short_bio?: string | null;
  location?: string | null;
  country?: string | null;
  phone_number?: string | null;
  referral_source?: string | null;
  date_of_birth?: string | null;
  categories: string[];
  profile_completed: boolean;
  account_status: 'active' | 'suspended';
  notify_messages: boolean;
  notify_announcements: boolean;
  notify_listing_activity: boolean;
  onboarding_extra: Record<string, string>;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
  recaptcha_token?: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: Role;
  phone_number: string;
  date_of_birth: string;
  referral_source?: string;
  recaptcha_token?: string;
}

export interface OtpVerifyPayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  new_password: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  username?: string;
  bio?: string;
  short_bio?: string;
  location?: string;
  categories?: string[];
  country?: string;
  onboarding_extra?: Record<string, string>;
}
