import React from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/contexts/auth-guard';
import { LayoutDashboard, Users, Map, Radio } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export const metadata = {
  title: 'Mosaic Command Center',
};

const adminNav = [
  { name: 'Dashboard', href: '/sys-admin', icon: LayoutDashboard },
  { name: 'Broadcast', href: '/sys-admin/broadcast', icon: Radio },
  { name: 'Users', href: '/sys-admin/users', icon: Users },
  { name: 'Villages', href: '/sys-admin/villages', icon: Map },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-theme-surface-low text-theme-on-surface font-sans">
        {/* Admin Sidebar */}
        <div className="w-64 border-r border-theme-outline/10 bg-theme-surface-high flex flex-col hidden md:flex">
          <div className="p-6 border-b border-theme-outline/10">
            <h1 className="font-serif text-2xl font-bold text-theme-forest flex items-center gap-2">
              <ShieldIcon /> Command Center
            </h1>
            <p className="text-xs text-theme-on-surface/50 mt-1 uppercase tracking-widest font-bold">Admin Only</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {adminNav.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-theme-on-surface/70 hover:bg-theme-forest/10 hover:text-theme-forest transition-colors"
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-theme-outline/10">
            <Link href={ROUTES.EXPLORE} className="flex items-center justify-center py-2 text-xs font-bold text-theme-accent hover:underline">
              &larr; Back to App
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-theme-accent">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
