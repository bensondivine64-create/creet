'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { postRequest, postHiring } from '@/lib/listings';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { clearListingsCache } from '@/lib/listingsCache';
import { CATEGORIES } from '@/lib/categories';
import { localCurrencyForCountry, currencySymbol, getRememberedCurrency, rememberCurrency } from '@/lib/currency';
import ImagePicker from '@/components/ImagePicker';
import CurrencyToggle from '@/components/CurrencyToggle';

export default function PostRequestPage() {
  const { user, loading: authLoading } = useRequireAuth('buyer');
  const router = useRouter();

  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', deadline: '' });
  const isRecruiter = (user?.onboarding_extra || {}).buyer_freelancer_type === 'Recruiter — hiring for a company';
  const [mode, setMode] = useState<'request' | 'hiring'>('request');
  const [images, setImages] = useState<string[]>([]);
  const [currency, setCurrency] = useState('NGN');
  const [currencyInit, setCurrencyInit] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const localCurrency = localCurrencyForCountry(user?.country);
  if (user && !currencyInit) {
    const remembered = getRememberedCurrency();
    setCurrency(remembered && (remembered === localCurrency || remembered === 'USD') ? remembered : localCurrency);
    setCurrencyInit(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category || 'General',
        price: Number(form.price) || 0,
        currency,
        deadline: form.deadline || undefined,
        images,
      };
      const res = mode === 'hiring' ? await postHiring(payload) : await postRequest(payload);
      clearListingsCache();
      router.push(`/listing/${res.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post request');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line safe-top">
        <Link href="/browse" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">{mode === 'hiring' ? 'Post a job' : 'Post a request'}</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <p className="text-sm text-fg/50 mb-6">
          {mode === 'hiring'
            ? 'Post a job opening for your company — freelancers will see it in Requests.'
            : "Post literally anything you're looking to hire for or buy — big or small."}
        </p>

        {isRecruiter && (
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('request')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                mode === 'request' ? 'bg-blue text-black border-blue' : 'border-line text-muted'
              }`}
            >
              Request
            </button>
            <button
              type="button"
              onClick={() => setMode('hiring')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                mode === 'hiring' ? 'bg-blue text-black border-blue' : 'border-line text-muted'
              }`}
            >
              Hiring (job post)
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1.5">What do you need?</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="I need a website developer"
              className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1.5">Details</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe what you need, timeline, and any requirements..."
              className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg/30 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1.5">
              Category <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Web Development, or leave blank"
              className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: prev.category === cat ? '' : cat }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium active:scale-[0.96] transition-transform ${
                    form.category === cat ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <CurrencyToggle
            localCurrency={localCurrency}
            value={currency}
            onChange={(c) => { setCurrency(c); rememberCurrency(c); }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">{mode === 'hiring' ? `Salary/Budget (${currencySymbol(currency)})` : `Budget (${currencySymbol(currency)})`}</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min={0}
                className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Deadline</label>
              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
          </div>

          <ImagePicker images={images} onChange={setImages} />

          <button
            type="submit"
            disabled={loading}
            className="ripple btn-elevated w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-3.5 transition-colors active:scale-[0.98]"
          >
            {loading ? 'Posting...' : mode === 'hiring' ? 'Post job' : 'Post request'}
          </button>
        </form>
      </div>
    </main>
  );
}
