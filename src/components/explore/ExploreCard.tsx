import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ExploreItem } from '@/services/explore';
import { TexturedCard } from '@/components/ui/textured-card';
import Image from 'next/image';

interface ExploreCardProps {
  item: ExploreItem;
  index: number;
  onClick: () => void;
}

export default function ExploreCard({ item, index, onClick }: ExploreCardProps) {
  const renderCardMetadata = (item: ExploreItem) => {
    const parts: string[] = [];
    if (item.members) parts.push(`${item.members} members`);
    if (item.location) parts.push(item.location);
    if (item.lastActivity) parts.push(item.lastActivity);

    return parts.join(' • ');
  };

  const imageSrc = item.imageUrl || '/assets/images/village-placeholder.png';

  return (
    <div onClick={onClick} className="group cursor-pointer h-full">
      <TexturedCard
        patternId={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
        patternColor="text-theme-clay"
        patternOpacity="opacity-15 group-hover:opacity-30 transition-opacity duration-300"
        className="bg-theme-surface-low p-0 rounded-xl border border-theme-outline/20 hover:border-theme-clay/40 transition-all duration-300 hover:shadow-lg flex h-full min-h-[170px] overflow-hidden"
      >
        <div className="flex w-full h-full">
          <div className="w-36 h-full relative shrink-0">
            <Image src={imageSrc} alt={item.communityName || item.title} fill className="object-cover" />
          </div>
          <div className="p-4 flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-serif text-lg text-theme-forest group-hover:text-theme-accent transition-colors leading-tight">
                    {item.communityName || item.title}
                  </h4>
                  <p className="text-[10px] font-sans text-theme-on-surface/60">Community</p>
                </div>
              </div>

              <p className="text-sm text-theme-on-surface/75 mt-3 line-clamp-3">{item.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${item.isMember ? 'bg-theme-forest/5 text-theme-forest border-theme-forest/20' : 'bg-theme-clay/10 text-theme-accent border-theme-clay/20'}`}>
                  {item.isMember ? 'Member' : 'View'}
                </span>
                <span className="text-[10px] font-sans text-theme-on-surface/60">{renderCardMetadata(item)}</span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-clay">Community</span>
              </div>

              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-theme-accent flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                Open <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </TexturedCard>
    </div>
  );
}
