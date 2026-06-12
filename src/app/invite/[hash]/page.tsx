'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function InvitePage({ params }: { params: { hash: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const villageId = searchParams.get('villageId');
  const { hash } = params;

  useEffect(() => {
    if (hash && villageId) {
      localStorage.setItem('pendingInvite', JSON.stringify({ hash, villageId }));
      router.push(ROUTES.AUTH);
      
    } else {
      router.push(ROUTES.LANDING);
    }
  }, [hash, villageId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-surface">
      <div className="flex flex-col items-center gap-4 text-theme-forest">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="font-serif italic text-xl">Preparing your invite...</p>
      </div>
    </div>
  );
}
