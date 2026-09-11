'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { changePassword, deleteAccount } from '@/lib/account';

export default function AccountSettingsPage() {
  const { user, loading } = useRequireAnyAuth();
  const { logout } = useAuth();
  const router = useRouter();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (loading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    setDeleting(true);
    try {
      await deleteAccount(deletePw);
      logout();
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete account');
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper pb-24">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/settings" className="text-sm text-muted hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Account</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-8">
        <div>
          <h2 className="font-semibold text-fg text-sm mb-3">Change password</h2>

          {pwError && (
            <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{pwError}</div>
          )}
          {pwSuccess && (
            <div className="mb-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">Password updated.</div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password"
              required
              className="w-full rounded-lg border border-line bg-mist px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password (min 8 characters)"
              required
              minLength={8}
              className="w-full rounded-lg border border-line bg-mist px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              disabled={pwSaving}
              className="w-full bg-blue hover:bg-blue-deep disabled:opacity-50 text-black text-sm font-semibold rounded-lg py-2.5 transition-colors"
            >
              {pwSaving ? 'Saving...' : 'Update password'}
            </button>
          </form>
        </div>

        <div className="pt-6 border-t border-line">
          <h2 className="font-semibold text-red-400 text-sm mb-1">Delete account</h2>
          <p className="text-xs text-muted mb-3">This permanently deletes your account and cannot be undone.</p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-mist border border-red-500/30 text-red-400 text-sm font-semibold rounded-lg py-2.5"
            >
              Delete my account
            </button>
          ) : (
            <div className="space-y-3">
              {deleteError && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{deleteError}</div>
              )}
              <input
                type="password"
                value={deletePw}
                onChange={(e) => setDeletePw(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full rounded-lg border border-red-500/30 bg-mist px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-500/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeletePw(''); setDeleteError(''); }}
                  className="flex-1 bg-mist border border-line text-fg text-sm font-semibold rounded-lg py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePw}
                  className="flex-1 bg-red-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5"
                >
                  {deleting ? 'Deleting...' : 'Confirm delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
