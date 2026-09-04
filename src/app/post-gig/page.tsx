'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createGig } from '@/lib/listings';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import ImagePicker from '@/components/ImagePicker';

export default function PostGigPage() {
  const { user, loading: authLoading } = useRequireAuth('freelancer');
  const router = useRouter();

  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', delivery_days: '' });
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createGig({
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price) || 0,
        delivery_days: Number(form.delivery_days) || 1,
        images,
      });
      router.push(`/listing/${res.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post gig');
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
        <Link href="/dashboard/freelancer" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Post a gig</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <p className="text-sm text-fg/50 mb-6">
          Offer a service — e.g. &quot;I will build your website.&quot;
        </p>

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
              placeholder="I will build your website"
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
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
              placeholder="Describe what's included, your process, and experience..."
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 resize-none focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              placeholder="Web Development"
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
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
                className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1">Delivery (days)</label>
              <input
                name="delivery_days"
                type="number"
                value={form.delivery_days}
                onChange={handleChange}
                required
                min={1}
                className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue transition-colors"
              />
            </div>
          </div>

          <ImagePicker images={images} onChange={setImages} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
          >
            {loading ? 'Posting...' : 'Post gig'}
          </button>
        </form>
      </div>
    </main>
  );
}
