'use client';

import { useEffect, useState } from 'react';

export default function DebugTokenPage() {
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('creet_token') || 'No token found — are you logged in?');
  }, []);

  return (
    <main style={{ padding: 20, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 12 }}>
      <p>Tap and hold to copy:</p>
      <p style={{ userSelect: 'all', marginTop: 10 }}>{token}</p>
    </main>
  );
}
