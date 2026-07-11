"use client";

import { useParams } from 'next/navigation';
import { useGetVillageDetails, useGetVillageActivityLog } from '@/services/villages';
import VillageStream from '@/components/village/VillageStream';
import AppPageContainer from '@/components/layout/AppPageContainer';
import { Skeleton } from '@/components/ui/skeleton';
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
  const { data: activityLog, isLoading: isLoadingActivity } = useGetVillageActivityLog(communityId);

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
            <VillageStream communityId={communityId} />
          </section>
        </div>

        {/* Right Column: Activity Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-theme-surface-high p-6 rounded-lg border border-theme-outline/20 sticky top-24">
            <h3 className="font-sans text-xs uppercase tracking-widest text-theme-accent mb-6 font-bold">Recent Activity</h3>
            {isLoadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 text-sm animate-pulse">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-theme-outline/20 shrink-0"></div>
                    <div className="h-4 bg-theme-outline/20 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : activityLog && activityLog.length > 0 ? (
              <div className="space-y-4">
                {activityLog.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-theme-clay shrink-0"></div>
                    <p className="text-theme-on-surface/80">{activity.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-theme-on-surface/50 italic">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </AppPageContainer>
  );
}
