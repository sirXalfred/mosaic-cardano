"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetVillageMembers, useRemoveVillageMembers, useGetVillageDetails, useShareInvite } from '@/services/villages';
import { useGetAuthState } from '@/services/auth';
import { StatePanel } from '@/components/ui/StatePanel';
import { Loader2, UserMinus, Shield, User as UserIcon, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import AppPageContainer from '@/components/layout/AppPageContainer';
import { Button } from '@/components/ui/button';
import { MemberGuard } from '@/contexts/member-guard';


export default function VillageMembersPage() {
  return (
    <MemberGuard>
      <VillageMembersPageContent />
    </MemberGuard>
  )
}

function VillageMembersPageContent() {
  const params = useParams();
  const communityId = params.community_id as string;

  const { data: members, isLoading, isError, refetch } = useGetVillageMembers(communityId);
  const { data: village } = useGetVillageDetails(communityId);
  const { data: authState } = useGetAuthState();
  
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const { mutate: removeMembers, isPending: isRemoving } = useRemoveVillageMembers(communityId);
  const { copyInvite, isGeneratingInvite } = useShareInvite(communityId);

  const isAdmin = village?.role === 'ADMIN';
  const activeUserId = authState?.user?.id;

  const handleToggleSelect = (memberId: string) => {
    if (memberId === activeUserId) return; // Prevent selecting self
    
    const next = new Set(selectedMemberIds);
    if (next.has(memberId)) {
      next.delete(memberId);
    } else {
      next.add(memberId);
    }
    setSelectedMemberIds(next);
  };

  const handleRemoveSelected = () => {
    if (selectedMemberIds.size === 0) return;
    
    if (confirm(`Are you sure you want to remove ${selectedMemberIds.size} member(s)?`)) {
      removeMembers(Array.from(selectedMemberIds), {
        onSuccess: () => {
          toast.success(`Removed ${selectedMemberIds.size} member(s)`);
          setSelectedMemberIds(new Set());
        },
        onError: () => {
          toast.error('Failed to remove members');
        }
      });
    }
  };

  const handleInvite = async () => {
    const url = await copyInvite();
    if (url) {
      toast.success('Invite link copied to clipboard!');
    }
  };

  return (
    <AppPageContainer title={`Members: ${village?.name}`} description="The creators, members and contributors building this community">
      <div className="flex md:items-end justify-end gap-6 mb-8">
        <div className="flex items-center gap-4">
          {isAdmin && selectedMemberIds.size > 0 && (
            <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200 animate-in fade-in slide-in-from-bottom-2">
              <span className="text-sm font-bold">{selectedMemberIds.size} selected</span>
              <Button
                variant="destructive"
                onClick={handleRemoveSelected}
                disabled={isRemoving}
              >
                {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <UserMinus size={16} />}
                Remove
              </Button>
            </div>
          )}

          {village?.isMember && (
            <Button
              onClick={handleInvite}
              disabled={isGeneratingInvite}
            >
              {isGeneratingInvite ? <Loader2 size={16} className="animate-spin" /> : <PlusIcon size={16} />}
              Add Member
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <StatePanel variant="loading" title="Loading Members" description="Fetching community members..." />
      ) : isError ? (
        <StatePanel variant="error" title="Failed to Load" description="An error occurred while fetching members." onRetry={() => refetch()} />
      ) : (!members || members.length === 0) ? (
        <StatePanel variant="empty" title="No Members" description="No members found in this community." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => {
            const isSelf = member.id === activeUserId;
            const isSelected = selectedMemberIds.has(member.id);
            const isMemberAdmin = member.role === 'ADMIN';

            return (
              <div 
                key={member.id} 
                className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isSelected ? 'border-red-500 bg-red-50/50' : 'border-theme-outline/20 bg-theme-surface hover:border-theme-forest/30'
                }`}
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-theme-outline/30 text-theme-forest focus:ring-theme-accent disabled:opacity-30"
                      checked={isSelected}
                      disabled={isSelf}
                      onChange={() => handleToggleSelect(member.id)}
                    />
                  </div>
                )}
                
                <div className="w-12 h-12 rounded-full overflow-hidden bg-theme-surface-high border border-theme-outline/20 flex-shrink-0 flex items-center justify-center">
                  {member.avatarUrl ? (
                    <Image src={member.avatarUrl} alt={member.displayName} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <UserIcon size={20} className="text-theme-on-surface/50" />
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0 pr-8">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-theme-forest truncate">{member.displayName}</h3>
                    {isMemberAdmin && <span title="Admin"><Shield size={14} className="text-theme-accent flex-shrink-0" /></span>}
                  </div>
                  <p className="text-xs text-theme-on-surface/60 truncate">
                    {member.username ? `@${member.username}` : member.id.split('-')[0]}
                  </p>
                  {isSelf && (
                    <span className="text-[10px] uppercase tracking-widest font-bold text-theme-forest mt-1">You</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppPageContainer>
  );
}
