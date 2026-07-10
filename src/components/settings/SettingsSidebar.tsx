import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bell, CreditCard } from 'lucide-react';
export type SettingsTab = 'account' | 'profile' | 'notifications';

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const tabs = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'profile', label: 'Profile Settings', icon: CreditCard }, // CreditCard as generic card/profile icon
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <nav className="w-full md:w-64 flex flex-col gap-1 border-r border-theme-outline/20 pr-4 py-4 min-h-[500px]">
      <h2 className="px-3 text-xs font-bold uppercase tracking-widest text-theme-on-surface/50 mb-4">User Settings</h2>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as SettingsTab)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium w-full text-left cursor-pointer",
              isActive 
                ? "bg-theme-clay/15 text-theme-accent" 
                : "text-theme-on-surface/75 hover:bg-theme-surface-high hover:text-theme-forest"
            )}
          >
            <Icon size={18} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
