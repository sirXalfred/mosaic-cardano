import React from 'react';
import { useGetVillageActivityLog } from '@/services/villages';
import { Loader2, Calendar, Settings, UserPlus, ShieldAlert } from 'lucide-react';

interface Props {
  communityId: string;
}

export default function ActivityLog({ communityId }: Props) {
  const { data: activities, isLoading } = useGetVillageActivityLog(communityId);

  if (isLoading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-theme-accent" /></div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center bg-theme-surface-raised rounded-xl border border-theme-outline/10">
        <ShieldAlert className="w-8 h-8 mx-auto text-theme-on-surface/30 mb-3" />
        <p className="text-theme-on-surface/50 font-sans">No activity recorded yet.</p>
        <p className="text-xs text-theme-on-surface/40 mt-1">Changes to settings or governance will appear here.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'SETTINGS_UPDATED': return <Settings className="w-4 h-4" />;
      case 'MEMBER_JOINED': return <UserPlus className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-theme-on-surface">Community Activity Log</h2>
        <p className="text-sm text-theme-on-surface/60 font-sans mt-1">
          A transparent record of administrative actions within the community.
        </p>
      </div>

      <div className="relative border-l-2 border-theme-outline/20 ml-3 pl-6 space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[31px] top-1 w-7 h-7 rounded-full bg-theme-surface border-2 border-theme-outline/20 flex items-center justify-center text-theme-on-surface/60 shadow-sm">
              {getIcon(activity.type)}
            </div>
            
            <div className="bg-theme-surface border border-theme-outline/10 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-theme-on-surface text-sm uppercase tracking-wider">{activity.type.replace('_', ' ')}</h3>
                  <p className="text-theme-on-surface/80 font-sans mt-1">{activity.description}</p>
                </div>
                <time className="text-xs text-theme-on-surface/50 whitespace-nowrap bg-theme-surface-raised px-2 py-1 rounded-md">
                  {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
