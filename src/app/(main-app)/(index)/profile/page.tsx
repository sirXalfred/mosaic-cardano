'use client';

import { ProfilePageContent } from '@/components/profile/ProfilePageContent';
import { AuthGuard } from '@/contexts/auth-guard';
import { useGetAuthState } from '@/services/auth';

export default function ProfilePage() {
  const {data } = useGetAuthState();
  return <AuthGuard>
    <ProfilePageContent username={String(data?.user?.id)} />
  </AuthGuard>
}
