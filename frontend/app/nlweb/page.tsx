'use client';

import { useEffect, useState } from 'react';
import { contextApi } from '@/lib/api';
import type { MCPEntry } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import NewsCard from '@/components/ui/NewsCard';

export default function NLWebPage() {
  const [entries, setEntries] = useState<MCPEntry[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const ctx = await contextApi.get('vc-latest');
        if (isMounted) setEntries(ctx.entries);
      } catch (err) {
        console.error('Failed to load context', err);
      }
    };

    load();
    const interval = setInterval(load, 60 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">News & Context</h1>
            <p className="text-gray-600">Latest venture capital headlines</p>
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => (
              <NewsCard key={e.id} entry={e} />
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
