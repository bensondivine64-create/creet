'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/contexts/useRequireAdmin';
import { getAdminReports, resolveReport, AdminReport } from '@/lib/reports';

export default function AdminReportsPage() {
  const { user, loading } = useRequireAdmin();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState('pending');
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setListLoading(true);
    getAdminReports(status || undefined)
      .then((res) => setReports(res.reports))
      .catch(() => setReports([]))
      .finally(() => setListLoading(false));
  }, [user, status]);

  async function handleResolve(id: number) {
    await resolveReport(id);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)));
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-mist border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-fg">Reports</span>
        <Link href="/admin" className="text-sm text-muted">← Dashboard</Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-5">
        <div className="flex gap-2 mb-4">
          {['pending', 'resolved', ''].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${status === s ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {listLoading && <p className="text-sm text-muted text-center py-10">Loading...</p>}
        {!listLoading && reports.length === 0 && <p className="text-sm text-muted text-center py-10">No reports.</p>}

        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-mist border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-fg">{r.reason}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-muted">Reported by {r.reporter}</p>
              <p className="text-xs text-muted">Target: {r.target_type} — {r.target_label}</p>
              {r.description && <p className="text-sm text-fg mt-2">{r.description}</p>}
              <p className="text-xs text-muted mt-2">{r.created_at && new Date(r.created_at).toLocaleString()}</p>

              <div className="flex gap-3 mt-3">
                {r.target_type === 'listing' && (
                  <Link href={`/listing/${r.target_id}`} className="text-xs text-fg underline underline-offset-2">View listing</Link>
                )}
                {r.target_type === 'user' && r.reporter_username && (
                  <Link href={`/u/${r.reporter_username}`} className="text-xs text-fg underline underline-offset-2">View reporter</Link>
                )}
                {r.status === 'pending' && (
                  <button onClick={() => handleResolve(r.id)} className="text-xs text-green-400 underline underline-offset-2">Resolve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
