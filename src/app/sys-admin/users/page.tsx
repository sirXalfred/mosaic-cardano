'use client';

import React, { useEffect, useState } from 'react';
import { StatePanel } from '@/components/ui/StatePanel';
import { Users } from 'lucide-react';
import { UserNode } from '@/types/schemas';

export default function AdminUsersPage() {
  const [data, setData] = useState<{items: UserNode[], total: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users?page=1')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
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

  if (isLoading) return <StatePanel variant="loading" title="Loading Users..." description="" />;
  if (error) return <StatePanel variant="error" title="Access Denied" errorMessage={error} description="" />;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-onrender --fade-in">
      <header className="flex justify-between items-center bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-theme-forest flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Users Registry
          </h2>
          <p className="text-theme-on-surface/60 mt-1">Showing {data?.items.length} of {data?.total} total users.</p>
        </div>
      </header>

      <div className="bg-theme-surface-high border border-theme-outline/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-theme-surface-low border-b border-theme-outline/10 uppercase text-xs font-bold text-theme-on-surface/50 tracking-wider">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Display Name</th>
                <th className="px-6 py-4">Plan Type</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-outline/5">
              {data?.items.map(user => (
                <tr key={user.id} className="hover:bg-theme-surface-low/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-theme-accent">@{user.username}</td>
                  <td className="px-6 py-4 font-medium">{user.displayName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      user.planType === 'PRO' ? 'bg-theme-accent/10 text-theme-accent' : 
                      user.planType === 'BASIC' ? 'bg-theme-forest/10 text-theme-forest' : 
                      'bg-theme-clay/10 text-theme-on-surface/60'
                    }`}>
                      {user.planType || 'FREE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-theme-on-surface/40">
                    {user.role || 'USER'}
                  </td>
                  <td className="px-6 py-4 text-theme-on-surface/60">
                    {new Date(user.createdAt).toLocaleDateString()}
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
