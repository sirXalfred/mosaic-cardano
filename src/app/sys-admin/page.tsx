'use client';

import React, { useEffect, useState } from 'react';
import { StatePanel } from '@/components/ui/StatePanel';
import { Users, Map, FileText, Wallet, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsData {
  users: { total: number; pro: number; basic: number; free: number };
  villages: number;
  pieces: number;
  treasuryBalance?: number;
  mrrHistory?: { month: string; revenue: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats (Check if you are an Admin)');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <StatePanel variant="loading" title="Loading Command Center" description="" />;
  if (error) return <StatePanel variant="error" title="Access Denied" errorMessage={error} description="" />;

  const isLive = process.env.NEXT_PUBLIC_IS_LIVE === 'true';

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-onrender --fade-in">
      <header className="flex justify-between items-center bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-serif font-bold text-theme-forest">System Overview</h2>
          <p className="text-theme-on-surface/60 mt-1">Real-time metrics for the Mosaic platform.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-theme-surface-low rounded-full border border-theme-outline/10">
            <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
            <span className="text-xs font-bold uppercase tracking-widest text-theme-on-surface/70">
              {isLive ? 'Mainnet Live' : 'Beta / Testnet'}
            </span>
          </div>
        </div>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Treasury Balance" 
          value={stats?.treasuryBalance != null ? `₳ ${stats.treasuryBalance.toLocaleString()}` : '...'} 
          icon={<Wallet className="text-green-600" />} 
          subtitle="Total ADA held"
          bgClass="bg-green-50"
        />
        <StatCard 
          title="Total Users" 
          value={stats?.users?.total?.toLocaleString() || '0'} 
          icon={<Users className="text-blue-600" />} 
          subtitle={`${stats?.users?.pro || 0} PRO / ${stats?.users?.basic || 0} BASIC`}
          bgClass="bg-blue-50"
        />
        <StatCard 
          title="Total Villages" 
          value={stats?.villages?.toLocaleString() || '0'} 
          icon={<Map className="text-orange-600" />} 
          subtitle="Active communities"
          bgClass="bg-orange-50"
        />
        <StatCard 
          title="Total Pieces" 
          value={stats?.pieces?.toLocaleString() || '0'} 
          icon={<FileText className="text-purple-600" />} 
          subtitle="Published artifacts"
          bgClass="bg-purple-50"
        />
      </div>

      {/* Plan Distribution Bar & MRR Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm">
          <h3 className="font-bold text-theme-forest mb-6 flex items-center gap-2">
            <Activity size={18} className="text-theme-accent" />
            Subscription Distribution
          </h3>
          <div className="space-y-4">
            <PlanBar label="PRO Users" count={stats?.users?.pro || 0} total={stats?.users?.total || 1} color="bg-theme-accent" />
            <PlanBar label="BASIC Users" count={stats?.users?.basic || 0} total={stats?.users?.total || 1} color="bg-theme-forest" />
            <PlanBar label="FREE Users" count={stats?.users?.free || 0} total={stats?.users?.total || 1} color="bg-theme-on-surface/20" />
          </div>
        </div>

        <div className="bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm flex flex-col">
          <h3 className="font-bold text-theme-forest mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-theme-accent" />
            Monthly Recurring Revenue (MRR)
          </h3>
          <div className="flex-1 min-h-[200px]">
            {stats?.mrrHistory && stats.mrrHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.mrrHistory} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e4e9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis 
                    domain={[0, 'auto']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    tickFormatter={(val) => `₳${Math.round(val)}`} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: '5 5' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: unknown) => [`₳ ${Number(value).toFixed(2)}`, 'Cumulative Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-theme-on-surface/50 text-sm">
                No revenue data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, bgClass }: { title: string, value: string, icon: React.ReactNode, subtitle: string, bgClass: string }) {
  return (
    <div className="bg-theme-surface-high p-6 rounded-2xl border border-theme-outline/10 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${bgClass}`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm font-bold text-theme-on-surface/50 uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-serif font-bold text-theme-forest mt-1">{value}</h4>
        <p className="text-xs text-theme-on-surface/60 mt-2 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function PlanBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const percentage = Math.round((count / total) * 100) || 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-theme-on-surface/70 uppercase tracking-widest">{label}</span>
        <span className="text-theme-on-surface">{count} ({percentage}%)</span>
      </div>
      <div className="h-3 w-full bg-theme-surface-low rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
