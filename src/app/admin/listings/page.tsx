'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/contexts/useRequireAdmin';
import { getAdminListings, deleteListingAdmin } from '@/lib/admin';
import { Listing } from '@/types/listing';

export default function AdminListingsPage() {
  const { user, loading } = useRequireAdmin();
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState('');
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setListLoading(true);
    getAdminListings({ search, kind })
      .then((res) => setListings(res.listings))
      .catch(() => setListings([]))
      .finally(() => setListLoading(false));
  }, [user, search, kind]);

  async function handleDelete(id: number) {
    if (!confirm('Remove this listing? This cannot be undone.')) return;
    await deleteListingAdmin(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-mist border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-fg">Listings</span>
        <Link href="/admin" className="text-sm text-muted">← Dashboard</Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          className="w-full rounded-lg border border-line bg-mist px-3 py-2.5 text-sm text-fg placeholder:text-muted mb-3"
        />
        <div className="flex gap-2 mb-4">
          {['', 'gig', 'product', 'request'].map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${kind === k ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'}`}>
              {k || 'All'}
            </button>
          ))}
        </div>

        {listLoading && <p className="text-sm text-muted text-center py-10">Loading...</p>}
        {!listLoading && listings.length === 0 && <p className="text-sm text-muted text-center py-10">No listings found.</p>}

        <div className="space-y-3">
          {listings.map((item) => (
            <div key={item.id} className="bg-mist border border-line rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-fg truncate">{item.title}</p>
                  <p className="text-xs text-muted">{item.kind} · {item.seller.full_name} (@{item.seller.username})</p>
                  <p className="text-xs text-muted mt-1">{item.currency} {item.price.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Link href={`/listing/${item.id}`} className="text-xs text-fg underline underline-offset-2">View</Link>
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 underline underline-offset-2">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
