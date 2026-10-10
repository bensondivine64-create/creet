'use client';

import { useEffect, useState } from 'react';
import { getUserPosts, NetworkPost } from '@/lib/network';
import { formatRelativeTime } from '@/lib/time';
import { optimizeImg } from '@/lib/img';

export default function ProfilePosts({ username }: { username: string }) {
  const [posts, setPosts] = useState<NetworkPost[] | null>(null);

  useEffect(() => {
    getUserPosts(username)
      .then((res) => setPosts(res.posts.slice(0, 5)))
      .catch(() => setPosts([]));
  }, [username]);

  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-display font-bold text-fg text-lg mb-4">Posts</h2>
      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="card-elevated bg-mist border border-line rounded-2xl p-4">
            <p className="text-sm text-fg/80 leading-relaxed whitespace-pre-wrap line-clamp-6">{p.content}</p>
            {p.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={optimizeImg(p.image_url, 700)} alt="" className="w-full max-h-72 object-cover" loading="lazy" />
              </div>
            )}
            {p.video_url && (
              <div className="mt-3 rounded-xl overflow-hidden bg-black">
                <video src={p.video_url} controls playsInline preload="metadata" className="w-full max-h-72" />
              </div>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted">
              <span>{formatRelativeTime(p.created_at)}</span>
              {p.like_count > 0 && <span>{p.like_count} like{p.like_count === 1 ? '' : 's'}</span>}
              {p.comment_count > 0 && <span>{p.comment_count} comment{p.comment_count === 1 ? '' : 's'}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
