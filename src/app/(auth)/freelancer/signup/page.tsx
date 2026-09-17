'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Recaptcha from '@/components/Recaptcha';
import GoogleButton from '@/components/GoogleButton';
import LoadingOverlay from '@/components/LoadingOverlay';
import PasswordInput from '@/components/PasswordInput';

const TOTAL_STEPS = 3;
const STEP_TITLES = ['Your details', 'Contact & password', 'Finish up'];
const REFERRAL_SOURCES = ['Friend or family', 'Social media', 'Search engine', 'Advertisement', 'Other'];

export default function FreelancerSignupPage() {
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: '', username: '', date_of_birth: '', phone_number: '',
    email: '', password: '', referral_source: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateStep1(): string {
    if (!form.full_name.trim()) return 'Please enter your full name';
    if (form.username.trim().length < 3) return 'Username must be at least 3 characters';
    if (!form.date_of_birth) return 'Date of birth is required';
    if (!form.phone_number.trim()) return 'Phone number is required';
    return '';
  }

  function validateStep2(): string {
    if (!form.email.trim()) return 'Please enter your email';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    return '';
  }

  function handleNext() {
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError('');
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed || !captchaToken) return;
    setError('');
    setLoading(true);
    try {
      const res = await signup({ ...form, role: 'freelancer', recaptcha_token: captchaToken });
      router.push(`/verify?email=${encodeURIComponent(res.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle(credential, 'freelancer');
      if (!res.user.profile_completed) {
        router.push('/create-profile');
      } else {
        router.push('/browse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const canSubmit = agreed && captchaToken.length > 0;
  const inputClass =
    'w-full rounded-lg border border-line bg-black px-3.5 py-3 text-sm text-fg placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-blue/40 focus:border-blue/50 transition-colors';

  return (
    <div className="animate-fade-in-up">
      {loading && <LoadingOverlay label="Creating your account..." />}

      <h1 className="font-display text-2xl font-bold text-fg mb-1.5">Become a freelancer</h1>
      <p className="text-sm text-muted mb-6">Offer your skills and get hired.</p>

      <GoogleButton onCredential={handleGoogle} />

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-line flex-1" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px bg-line flex-1" />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-fg">{STEP_TITLES[step - 1]}</span>
          <span className="text-xs text-muted">{step} / {TOTAL_STEPS}</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? 'bg-blue' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Full name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Username</label>
              <input name="username" value={form.username} onChange={handleChange} required minLength={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Date of birth</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Phone number</label>
              <input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} required placeholder="e.g. 08012345678" className={inputClass} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Password</label>
              <PasswordInput name="password" value={form.password} onChange={handleChange} required minLength={8} className={inputClass} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">
                How did you hear about CREET? <span className="text-muted font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {REFERRAL_SOURCES.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, referral_source: prev.referral_source === src ? '' : src }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                      form.referral_source === src ? 'bg-blue text-black' : 'border border-line text-muted'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            <Recaptcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

            <label className="flex items-start gap-2 text-sm text-fg/60">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-blue" />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="text-fg underline underline-offset-2 hover:text-white">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-fg underline underline-offset-2 hover:text-white">Privacy Policy</Link>.
              </span>
            </label>
          </>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button type="button" onClick={handleBack} className="flex-1 border border-line active:scale-[0.98] transition-transform text-fg text-sm font-semibold rounded-lg py-3.5">
              Back
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={handleNext} className="flex-1 bg-blue active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-lg py-3.5">
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading || !canSubmit} className="flex-1 bg-blue disabled:opacity-40 active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-lg py-3.5">
              {loading ? 'Creating account...' : 'Create freelancer account'}
            </button>
          )}
        </div>
      </form>

      <p className="text-sm text-muted text-center mt-7">
        Already have an account?{' '}
        <Link href="/login" className="text-fg font-medium underline underline-offset-2 hover:text-white">Log in</Link>
      </p>
    </div>
  );
}
