'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getListing, updateListing } from '@/lib/listings';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import ImagePicker from '@/components/ImagePicker';

export default function EditGigPage() {
  const { user, loading: authLoading } = useRequireAuth('freelancer');
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', delivery_days: '' });
  const [images, setImages] = useState<string[]>([]);
  const [loadingListing, setLoadingListing] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    getListing(params.id as string)
      .then((data) => {
        if (data.kind !== 'gig') {
          setError('This listing is not a gig');
          return;
        }
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          price: String(data.price),
          delivery_days: String(data.delivery_days),
        });
        setImages(data.images || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load listing'))
      .finally(() => setLoadingListing(false));
  }, [params.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateListing(Number(params.id), {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price) || 0,
        delivery_days: Number(form.delivery_days) || 1,
        images,
      });
      router.push(`/listing/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user || loadingListing) {
    return <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href={`/listing/${params.id}`} className="text-sm text-fg/50 hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Edit gig</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Title</label>
            <input
              name="title" value={form.title} onChange={handleChange} required
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} required rows={4}
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg/70 mb-1">Category</label>
            <input
              name="category" value={form.category} onChange={handleChange} required
              className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1">Price (₦)</label>
              <input
                name="price" type="number" value={form.price} onChange={handleChange} required min={0}
                className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg/70 mb-1">Delivery (days)</label>
              <input
                name="delivery_days" type="number" value={form.delivery_days} onChange={handleChange} required min={1}
                className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors"
              />
            </div>
          </div>

          <ImagePicker images={images} onChange={setImages} />

          <button
            type="submit" disabled={saving}
            className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-black text-sm font-semibold rounded-lg py-2.5 transition-colors"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  );
}
