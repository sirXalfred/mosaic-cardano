"use client";

import { useParams } from 'next/navigation';
import { useGetVillageDetails } from '@/services/villages';
import VillagePinnedBoard from '@/components/village/VillagePinnedBoard';
import VillageStream from '@/components/village/VillageStream';
import AppPageContainer from '@/components/layout/AppPageContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2 } from 'lucide-react';
import { MemberGuard } from '@/contexts/member-guard';



export default function VillageFeedPage() {
  return (
    <MemberGuard>
      <VillageFeedPageContent />
    </MemberGuard>
  )
}

function VillageFeedPageContent() {
  const params = useParams();
  const communityId = params.community_id as string;
  const { data: village, isLoading } = useGetVillageDetails(communityId);

  return (
    <AppPageContainer
      title={isLoading ? 'Loading...' : `Feed: ${village?.name}`}
      description={isLoading ? (
        <Skeleton className='w-80 h-6' />
      ) : (
        <p className="font-sans text-theme-on-surface/70 max-w-2xl">
          Coordinate on active projects, discuss ideas in the stream, and claim open needs.
        </p>
      )}>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Pinned Board & Stream */}
        <div className="lg:col-span-8 space-y-4">
          <section>
            <VillagePinnedBoard />
          </section>

          <section>
            <VillageStream communityId={communityId} />
          </section>
        </div>

        {/* Right Column: Activity Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-theme-surface-high p-6 rounded-lg border border-theme-outline/20">
            <h4 className="font-sans text-xs uppercase tracking-widest text-theme-accent font-bold mb-4">Village Code</h4>
            <ul className="text-sm text-theme-on-surface/80 space-y-3">
              <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-theme-forest shrink-0 mt-0.5" /> Respect elders and community knowledge.</li>
              <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-theme-forest shrink-0 mt-0.5" /> All pieces must cite their original sources.</li>
              <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-theme-forest shrink-0 mt-0.5" /> Bounties are open to all sworn members.</li>
            </ul>
          </div>

          <div className="bg-theme-surface-high p-6 rounded-lg border border-theme-outline/20 sticky top-24">
            <h3 className="font-sans text-xs uppercase tracking-widest text-theme-accent mb-6 font-bold">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-theme-clay shrink-0"></div>
                <p className="text-theme-on-surface/80"><span className="font-bold text-theme-forest">Amina Diallo</span> published a new draft in <span className="italic">Oral History Archive</span>.</p>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-theme-outline shrink-0"></div>
                <p className="text-theme-on-surface/80"><span className="font-bold text-theme-forest">Kofi Mensah</span> claimed the task &quot;GIS Mapping&quot;.</p>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-theme-outline shrink-0"></div>
                <p className="text-theme-on-surface/80"><span className="font-bold text-theme-forest">David Adeleke</span> joined the village.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppPageContainer>
  );
}
