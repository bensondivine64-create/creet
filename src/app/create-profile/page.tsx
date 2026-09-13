'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { updateProfile } from '@/lib/profile';
import { CATEGORIES } from '@/lib/categories';
import LoadingOverlay from '@/components/LoadingOverlay';

const EXPERIENCE_LEVELS = ['New to freelancing', '1-3 years', '3-5 years', '5+ years'];
const STORE_TYPES = ['Individual seller', 'Small business', 'Registered company'];
const BUDGET_RANGES = ['Under ₦20,000', '₦20,000 - ₦100,000', '₦100,000 - ₦500,000', '₦500,000+'];
const PRIOR_WORK_OPTIONS = ['Worked for a company', 'Worked with freelance clients', 'Both', "Neither yet — I'm new"];

export default function CreateProfilePage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [storeType, setStoreType] = useState('');
  const [shipsNationwide, setShipsNationwide] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  // Freelancer KYC (serious tier)
  const [legalName, setLegalName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [priorWorkType, setPriorWorkType] = useState('');
  const [priorWorkName, setPriorWorkName] = useState('');

  // Vendor KYC (medium tier)
  const [businessName, setBusinessName] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleCategory(cat: string) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function needsPriorWorkName() {
    return priorWorkType && priorWorkType !== "Neither yet — I'm new";
  }

  function validate(): string {
    if (categories.length === 0) return 'Please select at least one category';

    if (user?.role === 'freelancer') {
      if (!experience) return 'Please select your experience level';
      if (!legalName.trim()) return 'Full legal name is required';
      if (!dob) return 'Date of birth is required';
      if (!address.trim()) return 'Address is required';
      if (!priorWorkType) return 'Please answer whether you have worked before';
      if (needsPriorWorkName() && !priorWorkName.trim()) return 'Please name the company or client';
    }

    if (user?.role === 'vendor') {
      if (!storeType) return 'Please select what kind of seller you are';
      if (!shipsNationwide) return 'Please answer the shipping question';
      if (!businessName.trim()) return 'Business name is required';
    }

    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSaving(true);
    try {
      const onboarding_extra: Record<string, string> = {};

      if (user?.role === 'freelancer') {
        onboarding_extra.experience = experience;
        onboarding_extra.legal_name = legalName.trim();
        onboarding_extra.date_of_birth = dob;
        onboarding_extra.address = address.trim();
        onboarding_extra.prior_work_type = priorWorkType;
        if (needsPriorWorkName()) onboarding_extra.prior_work_name = priorWorkName.trim();
      }

      if (user?.role === 'vendor') {
        onboarding_extra.store_type = storeType;
        onboarding_extra.ships_nationwide = shipsNationwide;
        onboarding_extra.business_name = businessName.trim();
      }

      if (user?.role === 'buyer' && budgetRange) {
        onboarding_extra.budget_range = budgetRange;
      }

      await updateProfile({ bio, location, categories, onboarding_extra });
      await refreshUser();
      router.push('/browse');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  const bioLabel =
    user.role === 'freelancer'
      ? 'Tell buyers about your skills'
      : user.role === 'vendor'
      ? "Describe your store or what you sell"
      : 'What are you usually looking for?';

  const bioPlaceholder =
    user.role === 'freelancer'
      ? 'e.g. I build websites and mobile apps with 3 years of experience...'
      : user.role === 'vendor'
      ? 'e.g. We sell quality electronics and accessories...'
      : 'e.g. I usually hire designers and developers for small projects...';

  const categoryLabel =
    user.role === 'freelancer'
      ? 'What services do you offer?'
      : user.role === 'vendor'
      ? 'What do you sell?'
      : "What are you interested in?";

  const inputClass =
    'w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors';

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      {saving && <LoadingOverlay label="Saving your profile..." />}

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <span className="font-display text-xl font-bold text-fg">Set up your profile</span>
          <p className="text-sm text-muted mt-1">
            {user.role === 'freelancer'
              ? "A few required details so clients can trust who they're hiring."
              : user.role === 'vendor'
              ? 'A few details to verify your store.'
              : 'Just a couple questions so CREET works better for you.'}
          </p>
        </div>

        <div className="bg-mist border border-line rounded-2xl p-7">
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">{bioLabel}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={bioPlaceholder}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg/70 mb-2">{categoryLabel}</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                      categories.includes(cat)
                        ? 'bg-blue text-black'
                        : 'bg-paper border border-line text-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {user.role === 'freelancer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-fg/70 mb-2">How much experience do you have? *</label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperience(experience === lvl ? '' : lvl)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                          experience === lvl ? 'bg-blue text-black' : 'bg-paper border border-line text-muted'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-line">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">A bit about you</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-fg/70 mb-1.5">Full legal name *</label>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Your full name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-fg/70 mb-1.5">Date of birth *</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-fg/70 mb-1.5">Address *</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, city, state"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-fg/70 mb-2">Have you worked before? *</label>
                  <div className="flex flex-wrap gap-2">
                    {PRIOR_WORK_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPriorWorkType(priorWorkType === opt ? '' : opt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                          priorWorkType === opt ? 'bg-blue text-black' : 'bg-paper border border-line text-muted'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {needsPriorWorkName() && (
                  <div>
                    <label className="block text-sm font-medium text-fg/70 mb-1.5">
                      {priorWorkType === 'Worked with freelance clients' ? 'Name a client or two *' : 'Company name *'}
                    </label>
                    <input
                      type="text"
                      value={priorWorkName}
                      onChange={(e) => setPriorWorkName(e.target.value)}
                      placeholder={priorWorkType === 'Worked with freelance clients' ? 'e.g. Acme Ltd, Jane D.' : 'e.g. Acme Ltd'}
                      className={inputClass}
                    />
                  </div>
                )}
              </>
            )}

            {user.role === 'vendor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-fg/70 mb-2">What kind of seller are you? *</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setStoreType(storeType === t ? '' : t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                          storeType === t ? 'bg-blue text-black' : 'bg-paper border border-line text-muted'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg/70 mb-2">Do you ship nationwide? *</label>
                  <div className="flex flex-wrap gap-2">
                    {['Yes', 'No, local pickup/delivery only'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setShipsNationwide(shipsNationwide === v ? '' : v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                          shipsNationwide === v ? 'bg-blue text-black' : 'bg-paper border border-line text-muted'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-line">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Business details</p>
                  <div>
                    <label className="block text-sm font-medium text-fg/70 mb-1.5">Business name *</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your store or business name"
                      className={inputClass}
                    />
                  </div>
                </div>
              </>
            )}

            {user.role === 'buyer' && (
              <div>
                <label className="block text-sm font-medium text-fg/70 mb-2">What&apos;s your typical budget?</label>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_RANGES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBudgetRange(budgetRange === r ? '' : r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                        budgetRange === r ? 'bg-blue text-black' : 'bg-paper border border-line text-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue disabled:opacity-50 active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-lg py-3.5"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
