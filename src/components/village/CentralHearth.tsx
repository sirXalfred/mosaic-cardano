"use client";
import React from 'react';
import Link from 'next/link';
import { useGetVillageProjects } from '@/services/villages';
import { ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { ROUTES } from '@/lib/routes';

export default function CentralHearth({ communityId }: { communityId: string }) {
  const { data: projects, isLoading } = useGetVillageProjects();

  return (
    <div>
      <div className="flex items-end justify-between mb-6 border-b border-theme-outline/30 pb-2">
        <h3 className="font-serif text-2xl font-medium text-theme-forest">Projects</h3>
        <div className="flex gap-2 items-baseline">
          <span className="font-sans text-[10px] uppercase tracking-widest text-theme-on-surface/70 mb-1">
            {isLoading ? '...' : `${projects?.length || 0} Active Works`}
          </span>

          <Button asChild variant="link" size="sm">
            <Link href={ROUTES.VILLAGE.PROJECTS(communityId)}>
              View All
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-theme-surface-low rounded-lg border border-theme-outline/20"></div>
            <div className="h-32 bg-theme-surface-low rounded-lg border border-theme-outline/20"></div>
          </div>
        ) : (
          projects?.map((project) => (
            <div key={project.id} className="bg-theme-surface-low p-6 border border-theme-outline/40 rounded-lg group hover:border-theme-clay/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-serif text-xl mb-1">{project.title}</h4>
                  <p className="text-theme-on-surface/70 text-sm max-w-xl">{project.description}</p>
                </div>
                <span className="bg-theme-forest text-theme-parchment px-3 py-1 font-sans text-[10px] uppercase tracking-widest rounded-sm">
                  {project.progress}% Complete
                </span>
              </div>
              <div className="w-full h-1.5 bg-theme-outline/30 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-theme-clay" style={{ width: `${project.progress}%` }}></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  {/* Mock avatars based on contributors count */}
                  <div className="w-8 h-8 rounded-full border-2 border-theme-surface-low bg-amber-100 flex items-center justify-center text-[10px] font-bold">1</div>
                  <div className="w-8 h-8 rounded-full border-2 border-theme-surface-low bg-blue-100 flex items-center justify-center text-[10px] font-bold">2</div>
                  <div className="w-8 h-8 rounded-full border-2 border-theme-surface-low bg-green-100 flex items-center justify-center text-[10px] font-bold">3</div>
                  <div className="w-8 h-8 rounded-full border-2 border-theme-surface-low bg-theme-outline/30 flex items-center justify-center text-[10px] font-bold">
                    +{project.contributors - 3 > 0 ? project.contributors - 3 : 0}
                  </div>
                </div>
                <Link href={ROUTES.VILLAGE.PROJECT(communityId, project.id)} className="text-theme-accent font-sans text-[10px] uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Contribute <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
