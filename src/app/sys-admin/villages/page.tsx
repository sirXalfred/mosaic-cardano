'use client';

import React, { useEffect, useState } from 'react';
import { StatePanel } from '@/components/ui/StatePanel';
import { Map } from 'lucide-react';
import Link from 'next/link';
import { CommunityNode } from '@/types/schemas';

export default function AdminVillagesPage() {
  const [data, setData] = useState<{items: CommunityNode[], total: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/villages?page=1')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch villages');
        return res.json();
      })
      .then(json => {
        setData(json);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <StatePanel variant="loading" title="Loading Villages..." description="" />;
  if (error) return <StatePanel variant="error" title="Access Denied" errorMessage={error} description="" />;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-onrender --fade-in">
      <header className="flex justify-between items-center bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-theme-forest flex items-center gap-2">
            <Map size={24} className="text-orange-600" />
            Villages Registry
          </h2>
          <p className="text-theme-on-surface/60 mt-1">Showing {data?.items.length} of {data?.total} total villages.</p>
        </div>
      </header>

      <div className="bg-theme-surface-high border border-theme-outline/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-theme-surface-low border-b border-theme-outline/10 uppercase text-xs font-bold text-theme-on-surface/50 tracking-wider">
              <tr>
                <th className="px-6 py-4">Village Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-outline/5">
              {data?.items.map(village => (
                <tr key={village.id} className="hover:bg-theme-surface-low/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-theme-forest">{village.name}</td>
                  <td className="px-6 py-4 font-mono font-bold text-theme-accent text-xs">/v/{village.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      village.isPublic ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {village.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-theme-on-surface/60">
                    {new Date(village.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/v/${village.id}`} target="_blank" className="text-xs font-bold text-theme-accent hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
