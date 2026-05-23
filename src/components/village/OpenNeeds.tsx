"use client";
import React from 'react';
import { useGetVillageNeeds } from '@/services/villages';
import { PlusCircle } from 'lucide-react';

// import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OpenNeeds() {
  const { data: needs, isLoading } = useGetVillageNeeds();
  // const params = useParams();
  // const communityId = params.community_id as string;

  return (
    <div className="bg-theme-surface-high p-6 rounded-lg border border-theme-outline/40">
      <h3 className="font-serif text-xl font-medium mb-4">Open Needs</h3>
      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-theme-parchment rounded border border-theme-outline/20"></div>
            <div className="h-12 bg-theme-parchment rounded border border-theme-outline/20"></div>
            <div className="h-12 bg-theme-parchment rounded border border-theme-outline/20"></div>
          </div>
        ) : (
          needs?.map((need) => (
            <Link href={`/studio`} key={need.id} className="block">
              <div className="p-3 bg-theme-parchment border border-theme-outline/30 rounded flex justify-between items-center group cursor-pointer hover:border-theme-clay transition-all">
                <div>
                  <p className="font-medium text-theme-forest text-sm">{need.role}</p>
                  <p className="text-xs text-theme-on-surface/70">Project: {need.project}</p>
                </div>
                <PlusCircle size={20} className="text-theme-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
