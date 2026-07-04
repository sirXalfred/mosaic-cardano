"use client";
import React, { useEffect } from 'react';
import { Share, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useShareInvite } from '@/services/villages';
import { useGetAuthState, useGetVillageMembership } from '@/services/auth';
import { toast } from 'sonner';
import { TopAppBarWrapper } from '../layout/TopAppBar';
import { Button } from '../ui/button';
import MosaicBrand from '../ui/icons/MosaicBrand';

export default function VillageTopAppBar({ children }: { children?: React.ReactNode }) {
  const params = useParams();
  const communityId = params.community_id as string;
  const { data: authState } = useGetAuthState();
  const { data: membership } = useGetVillageMembership(communityId);

  const isMember = authState?.isAuthenticated && membership?.isMember;
  
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { copyInvite, isGeneratingInvite, isError, error } = useShareInvite(communityId, !!isMember);

  const handleShareInvite = async () => {
    const inviteUrl = await copyInvite();
    if (inviteUrl) {
      toast.success('Invite link copied to clipboard');
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || 'Failed to generate invite link');
    }
  }, [isError, error]);

  const leftContent = (
    <div className="flex items-center gap-6">
      {
        !isMember && (<MosaicBrand size="small" />)
      }
    </div>
  );

  const rightContent = (
    <div className="flex items-center gap-3 md:gap-6 border-r border-theme-outline/20 pr-3 md:pr-6 mr-1 md:mr-2">
      {/* ... */}
      {isMember && (
        <Button
          variant="outline" 
          size="sm"
          className="px-2 md:px-3"
          onClick={handleShareInvite}
          disabled={isGeneratingInvite}
        >
          {isGeneratingInvite ? <Loader2 size={16} className="animate-spin" /> : <Share size={16} />}
          <span className="hidden md:inline-block ml-1">INVITE</span>
        </Button>
      )}
    </div>
  );

  return (
    <TopAppBarWrapper leftContent={leftContent} rightContent={rightContent}>
      {children}
    </TopAppBarWrapper>
  );
}
