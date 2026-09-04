'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct } from '@/lib/listings';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import ImagePicker from '@/components/ImagePicker';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createProduct({
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price) || 0,
        condition: form.condition,
        stock: Number(form.stock) || 0,
        images,
      });
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
    <main className="min-h-screen bg-paper">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/dashboard/vendor" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Post a product</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <p className="text-sm text-fg/50 mb-6">List a physical product for sale.</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="iPhone 13 Pro, 128GB"
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the product's condition, specs, and details..."
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              placeholder="Electronics"
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1">Price (₦)</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                min={0}
                className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1">Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                min={0}
                className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Condition</label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>

          <ImagePicker images={images} onChange={setImages} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-black text-sm font-semibold rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Posting...' : 'Post product'}
          </button>
        </form>
      </div>
    </main>
  );
}
