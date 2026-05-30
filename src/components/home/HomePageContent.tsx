"use client";

import ActionItems from '@/components/home/ActionItems';
import ActiveProjectsList from '@/components/home/ActiveProjectsList';
import CommunityUpdates from '@/components/home/CommunityUpdates';
import SavedItems from '@/components/home/SavedItems';
import { useGetAuthState } from '@/services/auth';

export default function HomePageContent() {
  const { data } = useGetAuthState();
  const username = data?.user?.name;

  return (
    <div className="size-full max-w-7xl mx-auto flex flex-col lg:overflow-y-hidden px-4 md:px-8 py-8 gap-8">
      <div className="space-y-3">
        <h1 className="font-sans uppercase tracking-widest text-theme-accent font-bold block">
          FOR YOU, {username}
        </h1>
        <p className="text-theme-on-surface/60 font-sans leading-relaxed">
          Welcome back. Here is what needs your attention across your communities.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 lg:overflow-y-hidden">

        {/* Main Focus Area */}
        <section className="col-span-12 lg:col-span-8 lg:pr-4 lg:overflow-y-auto">
          <ActionItems />
          <ActiveProjectsList />
          <CommunityUpdates />
        </section>

        {/* Discovery & Periphery Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-12">
          <SavedItems />
        </aside>

      </div>
    </div>
  );
}
