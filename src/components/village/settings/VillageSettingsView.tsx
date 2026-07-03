"use client";

import React, { useState } from 'react';
import { useGetVillageSettings, useDeleteVillage } from '@/services/villages';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import ProfileSection from './ProfileSection';
import DescriptionEditor from './DescriptionEditor';
import PrivacySettings from './PrivacySettings';
import MemberManagement from './MemberManagement';
import ActivityLog from './ActivityLog';
import AppPageContainer from '@/components/layout/AppPageContainer';
import { ROUTES } from '@/lib/routes';

interface Props {
  communityId: string;
}

export default function VillageSettingsView({ communityId }: Props) {
  const { data: settings, isLoading } = useGetVillageSettings(communityId);
  const deleteMutation = useDeleteVillage(communityId);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'activity'>('general');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-theme-accent" />
      </div>
    );
  }

  if (!settings) {
    return <div className="p-8 text-center text-theme-on-surface/50">Settings not found</div>;
  }

  const isCreator = settings.isCreator ?? false;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this village? This action cannot be undone.")) {
      try {
        await deleteMutation.mutateAsync();
        router.push(ROUTES.HOME);
      } catch (e) {
        console.error(e);
        alert("Failed to delete village");
      }
    }
  };

  return (
    <AppPageContainer title="Settings" description="Manage your village settings">
        <div className="space-y-8 pb-24">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-theme-surface-raised border border-theme-accent/20 text-theme-accent">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <p className="text-sm font-sans">
              <strong>Progressive Decentralization:</strong> This community is currently in the bootstrap phase under founder stewardship. 
              As the village matures, governance and settings control will transition into decentralized, community-driven voting.
            </p>
          </div>

        <div className="flex gap-4 border-b border-theme-outline/20">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-2 font-sans font-medium transition-colors border-b-2 ${
              activeTab === 'general' ? 'border-theme-accent text-theme-on-surface' : 'border-transparent text-theme-on-surface/60 hover:text-theme-on-surface'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-2 font-sans font-medium transition-colors border-b-2 ${
              activeTab === 'members' ? 'border-theme-accent text-theme-on-surface' : 'border-transparent text-theme-on-surface/60 hover:text-theme-on-surface'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-2 font-sans font-medium transition-colors border-b-2 ${
              activeTab === 'activity' ? 'border-theme-accent text-theme-on-surface' : 'border-transparent text-theme-on-surface/60 hover:text-theme-on-surface'
            }`}
          >
            Activity Log
          </button>
        </div>

        <div className="space-y-12">
          {activeTab === 'general' && (
            <>
              <ProfileSection communityId={communityId} settings={settings} isCreator={isCreator} />
              <DescriptionEditor communityId={communityId} settings={settings} isCreator={isCreator} />
              <PrivacySettings communityId={communityId} settings={settings} isCreator={isCreator} />
              
              {isCreator && (
                <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-red-600 font-display">Danger Zone</h3>
                    <p className="text-sm font-sans text-theme-on-surface/60">Permanently delete this village and remove all members. This cannot be undone.</p>
                  </div>
                  <button 
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Village'}
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'members' && (
            <MemberManagement communityId={communityId} isCreator={isCreator} />
          )}

          {activeTab === 'activity' && (
            <ActivityLog communityId={communityId} />
          )}
        </div>
        </div>
    </AppPageContainer>
  );
}
