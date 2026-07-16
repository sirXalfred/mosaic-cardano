'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { AppIntent, INTENT_KEY } from '@/lib/intents';
import MosaicSymbol from '../ui/icons/MosaicSymbol';
import { StatePanel } from '../ui/StatePanel';


export function InvitePageContent({ hash, villageId }: { hash?: string, villageId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (hash && villageId) {
      localStorage.setItem(INTENT_KEY, AppIntent.INVITE_VILLAGE);
      localStorage.setItem(AppIntent.INVITE_VILLAGE, JSON.stringify({ hash, villageId }));
      router.push(ROUTES.VILLAGE.PROFILE(villageId));

    }
  }, [hash, villageId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-surface">
      <div className="flex flex-col items-center gap-4 text-theme-forest">
        <MosaicSymbol />
        <p className="font-serif italic text-xl">Preparing your invite...</p>
      </div>
      {
        !hash && !villageId && (
          <StatePanel
            variant="error"
            title="Invalid Invite"
            description="The invitation is invalid or has expired."
            hasAction={true}
            actionLabel="Go to Landing Page"
            onTriggerAction={() => router.push(ROUTES.LANDING)}
          />
        )
      }
    </div>
  );
}
