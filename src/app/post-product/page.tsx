'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct } from '@/lib/listings';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { clearListingsCache } from '@/lib/listingsCache';
import { localCurrencyForCountry, currencySymbol, getRememberedCurrency, rememberCurrency } from '@/lib/currency';
import ImagePicker from '@/components/ImagePicker';
import CurrencyToggle from '@/components/CurrencyToggle';

export default function PostProductPage() {
  const { user, loading: authLoading } = useRequireAuth('vendor');
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    condition: 'new' as 'new' | 'used',
    stock: '',
  });
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (images.length === 0) {
      setError('Please add at least one photo of your product.');
      return;
    }
    setLoading(true);
    try {
      const res = await createProduct({
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price) || 0,
        currency,
        condition: form.condition,
        stock: Number(form.stock) || 0,
        images,
      });
      clearListingsCache();
      router.push(`/listing/${res.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post product');
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
        <Link href="/dashboard/vendor" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Post a product</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <p className="text-sm text-fg/50 mb-6">List a physical product for sale.</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1.5">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="iPhone 13 Pro, 128GB"
              className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the product's condition, specs, and details..."
              className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg/30 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1.5">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              placeholder="Electronics"
              className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>

          <CurrencyToggle
            localCurrency={localCurrency}
            value={currency}
            onChange={(c) => { setCurrency(c); rememberCurrency(c); }}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Price ({currencySymbol(currency)})</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min={0}
                className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1.5">Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                min={0}
                className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1.5">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full rounded-lg border border-line bg-white/5 px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>

          <ImagePicker images={images} onChange={setImages} required />

          <button
            type="submit"
            disabled={loading || images.length === 0}
            className="ripple btn-elevated w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-black text-sm font-semibold rounded-xl py-3.5 transition-colors active:scale-[0.98]"
          >
            {loading ? 'Posting...' : images.length === 0 ? 'Add a photo to continue' : 'Post product'}
          </button>
        </form>
      </div>
    </main>
  );
}
