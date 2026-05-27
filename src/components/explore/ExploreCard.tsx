import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ExploreItem } from '@/services/explore';
import { TexturedCard } from '@/components/ui/textured-card';
import { useExploreStore } from '@/store/exploreStore';

interface ExploreCardProps {
  item: ExploreItem;
  index: number;
  onClick: () => void;
}

export default function ExploreCard({ item, index, onClick }: ExploreCardProps) {
  const { joinedCommunities, joinCommunity } = useExploreStore();

  const isJoined = joinedCommunities.includes(item.communityId);

  // Helper to get initials or emoji for a community name
  const getCommunityAvatar = (name: string) => {
    if (name.includes('Sahel')) return { char: '📜', bg: 'bg-amber-100 text-amber-800' };
    if (name.includes('Poetry')) return { char: '✍️', bg: 'bg-blue-100 text-blue-800' };
    if (name.includes('Hiking')) return { char: '🥾', bg: 'bg-green-100 text-green-800' };
    if (name.includes('Weavers')) return { char: '⚡', bg: 'bg-purple-100 text-purple-800' };
    if (name.includes('Agora')) return { char: '🏛️', bg: 'bg-rose-100 text-rose-800' };
    
    // Default fallback
    const initials = name
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return { char: initials, bg: 'bg-theme-outline/10 text-theme-forest/80' };
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail modal
    joinCommunity(item.communityId);
  };

  const renderCardMetadata = (item: ExploreItem) => {
    switch (item.type) {
      case 'collaboration':
        const partners = item.details.partners || [];
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-[9px] uppercase tracking-wider font-bold text-theme-on-surface/50 mr-3">
                Partners:
              </span>
              {partners.length === 2 ? (
                /* Venn Diagram overlap style for exactly 2 partners */
                <div className="flex items-center">
                  <div className="relative group/venn1 w-8 h-8 rounded-full border-2 border-theme-surface bg-theme-clay/10 text-theme-accent flex items-center justify-center text-[10px] font-bold z-10 shadow-sm transition-transform hover:translate-x-[-2px]" title={partners[0]}>
                    {getCommunityAvatar(partners[0]).char}
                  </div>
                  <div className="relative group/venn2 w-8 h-8 rounded-full border-2 border-theme-surface bg-theme-forest/10 text-theme-forest flex items-center justify-center text-[10px] font-bold -ml-3 z-20 shadow-sm transition-transform hover:translate-x-[2px]" title={partners[1]}>
                    {getCommunityAvatar(partners[1]).char}
                  </div>
                </div>
              ) : (
                /* Stacked circle list for other count sizes */
                <div className="flex -space-x-2.5 items-center">
                  {partners.slice(0, 3).map((p, i) => (
                    <div
                      key={p}
                      className="w-8 h-8 rounded-full border-2 border-theme-surface bg-theme-surface-high flex items-center justify-center text-[10px] font-bold shadow-sm"
                      style={{ zIndex: 10 + i }}
                      title={p}
                    >
                      {getCommunityAvatar(p).char}
                    </div>
                  ))}
                  {partners.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-theme-surface bg-theme-outline/25 flex items-center justify-center text-[9px] font-bold text-theme-on-surface/75 z-40 shadow-sm">
                      +{partners.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-[9px] font-sans font-bold uppercase tracking-widest text-theme-clay">
              Collaborative Project
            </div>
          </div>
        );
      case 'publication':
        return (
          <div className="space-y-1">
            <p className="text-[10px] font-sans text-theme-on-surface/60">
              By <span className="font-bold">{item.details.author}</span> • {item.details.publishedDate}
            </p>
            <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-clay">
              Written Publication
            </div>
          </div>
        );
      case 'project':
        return (
          <div className="space-y-1">
            <p className="text-[10px] font-sans text-theme-on-surface/60">
              Roles: <span className="font-bold text-theme-forest">{item.details.rolesNeeded?.join(', ')}</span>
            </p>
            <p className="text-[9px] font-mono text-theme-on-surface/50">
              Respond by: {item.details.deadline}
            </p>
          </div>
        );
      case 'residency':
        return (
          <div className="space-y-1">
            <p className="text-[10px] font-sans text-theme-on-surface/60">
              Grant: <span className="font-bold text-theme-forest">{item.details.stipend}</span> • Duration: {item.details.duration}
            </p>
            <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-clay">
              Creative Residency Call
            </div>
          </div>
        );
      case 'collection':
        return (
          <div className="space-y-1">
            <p className="text-[10px] font-sans text-theme-on-surface/60">
              Curator: <span className="font-bold">{item.details.curator}</span> • {item.details.totalArtifacts} Artifacts
            </p>
            <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-clay">
              Preserved Archive
            </div>
          </div>
        );
      case 'funded':
        return (
          <div className="space-y-1">
            <p className="text-[10px] font-sans text-theme-on-surface/60">
              Allocation: <span className="font-bold text-theme-forest">{item.details.fundingAmount}</span> • Approved {item.details.dateApproved}
            </p>
            <p className="text-[9px] font-mono text-theme-on-surface/50">
              Backed by {item.details.votersCount} steward reviews
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Dedicated visual render style for Communities
  if (item.type === 'community') {
    const avatar = getCommunityAvatar(item.communityName);

    return (
      <div onClick={onClick} className="group cursor-pointer h-full">
        <TexturedCard
          patternId={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
          patternColor="text-theme-clay"
          patternOpacity="opacity-15 group-hover:opacity-30 transition-opacity duration-300"
          className="bg-theme-surface-low p-6 rounded-xl border border-theme-outline/20 hover:border-theme-clay/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-full min-h-[170px]"
        >
          <div className="space-y-3">
            {/* Header row with avatar and topic badge */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border border-theme-outline/20 flex items-center justify-center text-lg font-bold shadow-sm shrink-0 ${avatar.bg}`}>
                  {avatar.char}
                </div>
                <div>
                  <h4 className="font-serif text-base text-theme-forest group-hover:text-theme-accent transition-colors leading-tight">
                    {item.communityName}
                  </h4>
                  {item.location && item.location !== 'Remote' && (
                    <span className="text-[9px] font-mono text-theme-on-surface/50 block">
                      📍 {item.location}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-on-surface/50 border border-theme-outline/25 px-2 py-0.5 rounded bg-theme-parchment/40 whitespace-nowrap">
                {item.topic}
              </span>
            </div>
            
            <p className="text-xs text-theme-on-surface/75 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-theme-outline/10 flex items-center justify-between">
            <span className="text-[10px] font-sans text-theme-on-surface/60">
              <span className="font-bold">{item.details.membersCount || 89}</span> Members
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleJoinClick}
                disabled={isJoined}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isJoined
                    ? 'bg-theme-outline/10 text-theme-on-surface/40 border border-transparent cursor-not-allowed'
                    : 'bg-theme-forest text-theme-parchment hover:opacity-90 border border-transparent shadow-sm'
                }`}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
              
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-accent flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Open <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        </TexturedCard>
      </div>
    );
  }

  // Visual render style for all other item types (Collaborations, Publications, Projects, Residencies, Collections, Funded)
  return (
    <div onClick={onClick} className="group cursor-pointer h-full">
      <TexturedCard
        patternId={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
        patternColor="text-theme-clay"
        patternOpacity="opacity-15 group-hover:opacity-30 transition-opacity duration-300"
        className="bg-theme-surface-low p-6 rounded-xl border border-theme-outline/20 hover:border-theme-clay/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between h-full min-h-[170px]"
      >
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-theme-accent bg-theme-clay/10 px-2 py-0.5 rounded">
                {item.type}
              </span>
              {item.location && item.location !== 'Remote' && (
                <span className="text-[9px] font-mono text-theme-on-surface/60">
                  📍 {item.location}
                </span>
              )}
            </div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-on-surface/50 border border-theme-outline/25 px-2 py-0.5 rounded bg-theme-parchment/40 whitespace-nowrap">
              {item.topic}
            </span>
          </div>
          <h4 className="font-serif text-lg text-theme-forest group-hover:text-theme-accent transition-colors leading-tight">
            {item.title}
          </h4>
          <p className="text-xs text-theme-on-surface/75 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-theme-outline/10 flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-wider font-bold text-theme-on-surface/50">
              {item.communityName}
            </p>
            {renderCardMetadata(item)}
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-accent flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
            Open <ArrowUpRight size={12} />
          </span>
        </div>
      </TexturedCard>
    </div>
  );
}
