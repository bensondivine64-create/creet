'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall, ApiError } from '@/lib/api';
import {
  User,
  AuthResponse,
  LoginPayload,
  SignupPayload,
  OtpVerifyPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  Role,
} from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; message: string; email: string }>;
  verifyOtp: (payload: OtpVerifyPayload) => Promise<AuthResponse>;
  resendOtp: (email: string) => Promise<{ success: boolean }>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<{ success: boolean; message: string }>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (credential: string, role?: Role) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_ME_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('creet_token');
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function tryFetchMe(attempt: number) {
      try {
        const data = await apiCall<User>('/auth/me');
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('creet_token');
          setLoading(false);
          return;
        }

        if (attempt < MAX_ME_RETRIES) {
          setTimeout(() => tryFetchMe(attempt + 1), RETRY_DELAY_MS);
        } else {
          setLoading(false);
        }
      }
    }

    tryFetchMe(0);
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(payload: LoginPayload) {
    const data = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    localStorage.setItem('creet_token', data.access_token);
    setUser(data.user);
    return data;
  }

  async function signup(payload: SignupPayload) {
    const data = await apiCall<{ success: boolean; message: string; email: string }>('/auth/signup', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    return data;
  }

  async function verifyOtp(payload: OtpVerifyPayload) {
    const data = await apiCall<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: payload,
      auth: false,
    });
    localStorage.setItem('creet_token', data.access_token);
    setUser(data.user);
    return data;
  }

  async function resendOtp(email: string) {
    return apiCall<{ success: boolean }>('/auth/resend-otp', {
      method: 'POST',
      body: { email },
      auth: false,
    });
  }

  async function forgotPassword(payload: ForgotPasswordPayload) {
    return apiCall<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  }

  async function resetPassword(payload: ResetPasswordPayload) {
    return apiCall<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  }

  async function loginWithGoogle(credential: string, role?: Role) {
    const data = await apiCall<AuthResponse>('/auth/google', {
      method: 'POST',
      body: { credential, role },
      auth: false,
    });
    localStorage.setItem('creet_token', data.access_token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem('creet_token');
    setUser(null);
    router.push('/');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
