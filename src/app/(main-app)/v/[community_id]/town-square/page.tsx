"use client";

import { useParams } from 'next/navigation';
import { useGetVillageDetails } from '@/services/villages';
import CentralHearth from '@/components/village/CentralHearth';
import VillageStream from '@/components/village/VillageStream';
import OpenNeeds from '@/components/village/OpenNeeds';
import AppPageContainer from '@/components/layout/AppPageContainer';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkspacePage() {
  const params = useParams();
  const communityId = params.community_id as string;
  const { data: village, isLoading } = useGetVillageDetails(communityId);

  return (
    <AppPageContainer
      title={isLoading ? 'Loading...' : `Welcome to ${village?.name}`}
      description={isLoading ? (
        <Skeleton className='w-80 h-6' />
      ) : (
        <p className="font-sans text-theme-on-surface/70 max-w-2xl">
          Coordinate on active projects, discuss ideas in the stream, and claim open needs.
        </p>
      )}>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Projects & Stream */}
        <div className="lg:col-span-8 space-y-16">
          <section>
            <CentralHearth communityId={communityId} />
          </section>

          <section>
            <VillageStream communityId={communityId} />
          </section>
        </div>

        {/* Right Column: Needs & Activity */}
        <div className="lg:col-span-4 space-y-8">
          <OpenNeeds />

          <div className="bg-theme-surface-high p-6 rounded-lg border border-theme-outline/20">
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
