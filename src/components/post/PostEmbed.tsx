import React from 'react';
import { EntityPlaceholder, EntityType } from '@/components/ui/EntityPlaceholder';
import { Loader2, ExternalLink } from 'lucide-react';
import { useGetEmbedPostData } from '@/services/posts';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';

interface Props {
  type: EntityType;
  id: string;
}

export function PostEmbed({ type, id }: Props) {
  // We fetch minimal details for the entity. We can optimize this later with a batch endpoint.
  const { data, isLoading, error } = useGetEmbedPostData(type, id);

  // const handleClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (type === 'village') router.push(ROUTES.VILLAGE.HOME(id));
  //   else if (type === 'project') router.push(ROUTES.VILLAGE.PROJECT(id)); // Adjust routing as needed
  //   else if (type === 'piece' || type === 'publication') router.push(ROUTES.WORKSPACE_EDITOR(id));
  // };

  if (isLoading) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-theme-outline/10 bg-theme-surface-low p-4 my-2 flex items-center justify-center h-24">
        <Loader2 className="w-5 h-5 animate-spin text-theme-accent/50" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-red-500/20 bg-red-500/5 p-4 my-2 text-red-500 text-xs flex items-center">
        Embedded {type} could not be loaded.
      </div>
    );
  }

  const getLink = () => {
    if (type === 'village') return ROUTES.VILLAGE.HOME(id);
    else if (type === 'project') return ROUTES.VILLAGE.PROJECT('none', id); // todo: add community_id to project
    else if (type === 'piece' || type === 'publication') return ROUTES.ARTIFACT(id);
    else if (type === 'document') return ROUTES.WORKSPACE_EDITOR(id);
    return '#';
  }

  return (
    <Link
      href={getLink()}
      className="w-full max-w-sm rounded-xl border border-theme-outline/20 bg-theme-surface hover:border-theme-accent hover:bg-theme-surface-raised transition-all my-3 cursor-pointer group overflow-hidden flex shadow-sm"
    >
      <div className="w-24 shrink-0 bg-theme-surface-low border-r border-theme-outline/10 group-hover:bg-theme-surface-raised transition-colors flex items-center justify-center p-2">
        <EntityPlaceholder type={type} className="w-16 h-16 opacity-80 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-theme-accent bg-theme-accent/10 px-1.5 py-0.5 rounded">
            {type}
          </span>
        </div>
        <h4 className="font-bold text-sm text-theme-forest truncate group-hover:text-theme-accent transition-colors">
          {data.title || 'Untitled'}
        </h4>
        <p className="text-xs text-theme-on-surface/50 truncate mt-0.5">
          {data.description || 'Click to view details'}
        </p>
      </div>

      <div className="px-3 flex items-center justify-center text-theme-on-surface/30 group-hover:text-theme-accent transition-colors">
        <ExternalLink size={16} />
      </div>
    </Link>
  );
}
