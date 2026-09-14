'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { updateProfile } from '@/lib/profile';
import { CATEGORIES } from '@/lib/categories';
import LoadingOverlay from '@/components/LoadingOverlay';
import CountryPicker from '@/components/CountryPicker';

const EXPERIENCE_LEVELS = ['New to freelancing', '1-3 years', '3-5 years', '5+ years'];
const STORE_TYPES = ['Individual seller', 'Small business', 'Registered company'];
const BUDGET_RANGES = ['Under ₦20,000', '₦20,000 - ₦100,000', '₦100,000 - ₦500,000', '₦500,000+'];
const PRIOR_WORK_OPTIONS = ['Worked for a company', 'Worked with freelance clients', 'Both', "Neither yet — I'm new"];
const BUYER_INTENTS = ['Freelancers', 'Vendors'];
const BUYER_FREELANCER_TYPES = ['Just looking for services', 'Recruiter — hiring for a company'];

const TOTAL_STEPS = 3;

export default function CreateProfilePage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [bio, setBio] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [storeType, setStoreType] = useState('');
  const [shipsNationwide, setShipsNationwide] = useState('');
  const [budgetRange, setBudgetRange] = useState('');

  const [legalName, setLegalName] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [priorWorkType, setPriorWorkType] = useState('');
  const [priorWorkName, setPriorWorkName] = useState('');

  const [businessName, setBusinessName] = useState('');

  const [buyerIntent, setBuyerIntent] = useState('');
  const [buyerFreelancerType, setBuyerFreelancerType] = useState('');

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

  function validateStep1(): string {
    if (!country) return 'Please select your country';
    return '';
  }

  function validateStep2(): string {
    if (categories.length === 0) return 'Please select at least one category';
    return '';
  }

  function validateStep3(): string {
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
    if (user?.role === 'buyer') {
      if (!buyerIntent) return "Please tell us what you're looking for";
      if (buyerIntent === 'Freelancers' && !buyerFreelancerType) return 'Please answer the recruiter question';
    }
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
    const validationError = validateStep3();
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

      if (user?.role === 'buyer') {
        if (budgetRange) onboarding_extra.budget_range = budgetRange;
        onboarding_extra.buyer_intent = buyerIntent;
        if (buyerIntent === 'Freelancers') onboarding_extra.buyer_freelancer_type = buyerFreelancerType;
      }

      await updateProfile({ bio, short_bio: shortBio, location, country, categories, onboarding_extra });
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

  const stepTitles = ['About you', categoryLabel.replace('?', ''), user.role === 'buyer' ? 'A few more questions' : 'Verification'];

  const inputClass =
    'w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors';

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      {saving && <LoadingOverlay label="Saving your profile..." />}

      <div className="w-full max-w-md">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-xl font-bold text-fg">Set up your profile</span>
            <span className="text-xs text-muted font-medium">{step} / {TOTAL_STEPS}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < step ? 'bg-blue' : 'bg-line'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted mt-3">{stepTitles[step - 1]}</p>
        </div>

        <div className="bg-mist border border-line rounded-2xl p-7">
          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-fg/70 mb-1.5">Bio</label>
                  <input
                    type="text"
                    value={shortBio}
                    onChange={(e) => setShortBio(e.target.value.slice(0, 150))}
                    placeholder="A short line that shows on your profile"
                    className={inputClass}
                  />
                  <p className="text-xs text-muted mt-1.5">{shortBio.length}/150 · shown publicly</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-fg/70 mb-1.5">{bioLabel}</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={bioPlaceholder}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-xs text-muted mt-1.5">Not shown on your profile — helps CREET match you with the right deals and feed.</p>
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
                  <label className="block text-sm font-medium text-fg/70 mb-1.5">Country *</label>
                  <CountryPicker value={country} onChange={setCountry} />
                  <p className="text-xs text-muted mt-1.5">This sets your currency and what shows in your feed.</p>
                </div>
              </>
            )}

            {step === 2 && (
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
            )}

            {step === 3 && user.role === 'freelancer' && (
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

            {step === 3 && user.role === 'vendor' && (
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

            {step === 3 && user.role === 'buyer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-fg/70 mb-2">Are you looking for freelancers or vendors? *</label>
                  <div className="flex flex-wrap gap-2">
                    {BUYER_INTENTS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setBuyerIntent(buyerIntent === v ? '' : v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                          buyerIntent === v ? 'bg-blue text-black' : 'bg-paper border border-line text-muted'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {buyerIntent === 'Freelancers' && (
                  <div>
                    <label className="block text-sm font-medium text-fg/70 mb-2">Are you a recruiter or just looking for services? *</label>
                    <div className="flex flex-wrap gap-2">
                      {BUYER_FREELANCER_TYPES.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setBuyerFreelancerType(buyerFreelancerType === v ? '' : v)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                            buyerFreelancerType === v ? 'bg-blue text-black' : 'bg-paper border border-line text-muted'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
              </>
            )}

            <div className="flex gap-3 pt-1">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-paper border border-line active:scale-[0.98] transition-transform text-fg text-sm font-semibold rounded-lg py-3.5"
                >
                  Back
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-blue active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-lg py-3.5"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue disabled:opacity-50 active:scale-[0.98] transition-transform text-black text-sm font-semibold rounded-lg py-3.5"
                >
                  Finish
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
