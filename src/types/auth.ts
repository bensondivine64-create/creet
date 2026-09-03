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
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  categories: string[];
  profile_completed: boolean;
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
  bio?: string;
  location?: string;
  categories?: string[];
}
