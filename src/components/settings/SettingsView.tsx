'use client';

import React, { useState } from 'react';
import SettingsSidebar, { SettingsTab } from './SettingsSidebar';
import { useGetSettings } from '@/services/settings';
import { StatePanel } from '../ui/StatePanel';

import ProfileTab from './tabs/ProfileTab';
import NotificationsTab from './tabs/NotificationsTab';
import AccountTab from './tabs/AccountTab';


export default function SettingsView({ initialTab }: { initialTab?: SettingsTab }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab || 'account');
  const { data: settings, isLoading, isError, error } = useGetSettings();

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <StatePanel variant="loading" title="Loading Settings" description="Please wait..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <StatePanel variant="error" title="Error Loading Settings" description="Failed to load settings." errorMessage={error?.message} />
      </div>
    );
  }

  const renderTabContent = () => {
    if (!settings) return null;
    
    switch (activeTab) {
      case 'account': return <AccountTab />;
      case 'profile': return <ProfileTab settings={settings.profile} />;
      case 'notifications': return <NotificationsTab settings={settings.notifications} />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 h-full flex flex-col">
      <h1 className="text-2xl font-serif text-theme-forest mb-8">Settings</h1>
      <div className="flex flex-col md:flex-row gap-8 flex-1">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 pb-16">
          <div className="bg-theme-surface-low rounded-2xl border border-theme-outline/15 shadow-sm p-6 md:p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
