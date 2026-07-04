'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { AppIntent, INTENT_KEY } from '@/lib/intents';
import MosaicSymbol from '../ui/icons/MosaicSymbol';


export function InvitePageContent({ hash, villageId }: { hash?: string, villageId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (hash && villageId) {
      localStorage.setItem(INTENT_KEY, AppIntent.INVITE_VILLAGE);
      localStorage.setItem(AppIntent.INVITE_VILLAGE, JSON.stringify({ hash, villageId }));
      router.push(ROUTES.VILLAGE.HOME(villageId));

    } else {
      router.push(ROUTES.LANDING);
    }
  }, [hash, villageId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-surface">
      <div className="flex flex-col items-center gap-4 text-theme-forest">
        <MosaicSymbol />
        <p className="font-serif italic text-xl">Preparing your invite...</p>
      </div>
    </div>
  );
}
