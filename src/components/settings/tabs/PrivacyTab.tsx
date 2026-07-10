import React from 'react';
import { useDebouncedSettingsUpdate } from '@/services/settings';
import { UserSettings } from '@/types/settings';
import { Switch } from '@/components/ui/switch';

export default function PrivacyTab({ settings }: { settings: UserSettings['privacy'] }) {
  const { mutate } = useDebouncedSettingsUpdate();

  const handleToggle = (key: keyof UserSettings['privacy'], value: boolean | string) => {
    mutate({ privacy: { ...settings, [key]: value } });
  };

  return (
    <div className="space-y-8 animate-onrender --fade-in">
      <div>
        <h2 className="text-xl font-bold text-theme-forest mb-2">Safety & Privacy</h2>
        <p className="text-sm text-theme-on-surface/60">Manage your visibility and interactions on Mosaic.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between py-2">
          <div className="pr-4">
            <h3 className="text-sm font-bold text-theme-on-surface">Discoverability</h3>
            <p className="text-xs text-theme-on-surface/60 mt-1">Allow your profile to be found in search results and village (community) member lists.</p>
          </div>
          <Switch 
            checked={settings.discoverable}
            onCheckedChange={(c) => handleToggle('discoverable', c)}
          />
        </div>

        <hr className="border-theme-outline/10" />

        <div className="py-2">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-theme-on-surface">Direct Messaging</h3>
            <p className="text-xs text-theme-on-surface/60 mt-1">Who can send you direct messages.</p>
          </div>
          <select 
            value={settings.allowMessagesFrom}
            onChange={(e) => handleToggle('allowMessagesFrom', e.target.value)}
            className="w-full md:w-64 p-2.5 bg-theme-surface-high border border-theme-outline/20 rounded-xl focus:outline-none focus:border-theme-clay/55 text-sm font-medium text-theme-on-surface"
          >
            <option value="EVERYONE">Everyone</option>
            <option value="NOBODY">Nobody</option>
          </select>
        </div>
      </div>
    </div>
  );
}
