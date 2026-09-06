'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/contexts/useRequireAdmin';
import { getAdminUsers, verifyUser, unverifyUser, suspendUser, activateUser, makeAdmin, removeAdmin, AdminUser } from '@/lib/admin';

export default function AdminUsersPage() {
  const { user, loading } = useRequireAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [listLoading, setListLoading] = useState(true);

  function load() {
    setListLoading(true);
    getAdminUsers({ search, status, role })
      .then((res) => setUsers(res.users))
      .catch(() => setUsers([]))
      .finally(() => setListLoading(false));
  }

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, status, role]);

  async function act(fn: (id: number) => Promise<unknown>, u: AdminUser, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    const updated = (await fn(u.id)) as AdminUser;
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)));
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-mist border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold text-fg">Users</span>
        <Link href="/admin" className="text-sm text-muted">← Dashboard</Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username, email..."
          className="w-full rounded-lg border border-line bg-mist px-3 py-2.5 text-sm text-fg placeholder:text-muted mb-3"
        />

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['', 'buyer', 'freelancer', 'vendor'].map((r) => (
            <button key={r} onClick={() => setRole(r)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${role === r ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'}`}>
              {r || 'All roles'}
            </button>
          ))}
          {['', 'active', 'suspended'].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${status === s ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'}`}>
              {s || 'All status'}
            </button>
          ))}
        </div>

        {listLoading && <p className="text-sm text-muted text-center py-10">Loading...</p>}

        {!listLoading && users.length === 0 && <p className="text-sm text-muted text-center py-10">No users found.</p>}

        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-mist border border-line rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-fg">{u.full_name} <span className="text-muted font-normal">@{u.username}</span></p>
                  <p className="text-xs text-muted">{u.email} · {u.role}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${u.account_status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {u.account_status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {u.is_verified ? (
                  <button onClick={() => act(unverifyUser, u)} className="text-xs bg-paper border border-line rounded-full px-3 py-1 text-muted">Unverify</button>
                ) : (
                  <button onClick={() => act(verifyUser, u)} className="text-xs bg-paper border border-line rounded-full px-3 py-1 text-fg">Verify</button>
                )}
                {u.account_status === 'active' ? (
                  <button onClick={() => act(suspendUser, u, 'Suspend this user?')} className="text-xs bg-paper border border-line rounded-full px-3 py-1 text-red-400">Suspend</button>
                ) : (
                  <button onClick={() => act(activateUser, u)} className="text-xs bg-paper border border-line rounded-full px-3 py-1 text-green-400">Activate</button>
                )}
                {u.is_admin ? (
                  <button onClick={() => act(removeAdmin, u, 'Remove admin access?')} className="text-xs bg-paper border border-line rounded-full px-3 py-1 text-muted">Remove admin</button>
                ) : (
                  <button onClick={() => act(makeAdmin, u, 'Grant admin access?')} className="text-xs bg-paper border border-line rounded-full px-3 py-1 text-fg">Make admin</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
