import { NextResponse } from 'next/server';

import { authService } from '@/services/backend/auth.service';
import { AuthStateResponseSchema } from '@/types/api';
import { getAuthSessionByToken, sessionCookieName } from '@/lib/backend/session';

export const runtime = 'nodejs';

const toAuthState = (user: Awaited<ReturnType<typeof authService.getUserById>>) => {
  if (!user) {
    return { isAuthenticated: false, user: null };
  }

  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      name: user.displayName,
      initials: user.displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 3),
      isOnboarded: user.isOnboarded,
      avatarUrl: null,
    },
  };
};

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${sessionCookieName}=`))
    ?.split('=')[1];

  const session = await getAuthSessionByToken(token ? decodeURIComponent(token) : undefined);
  if (!session) {
    return NextResponse.json(AuthStateResponseSchema.parse({ isAuthenticated: false, user: null }));
  }

  const user = await authService.getUserById(session.userId);
  if (!user) {
    return NextResponse.json(AuthStateResponseSchema.parse({ isAuthenticated: false, user: null }));
  }

  return NextResponse.json(AuthStateResponseSchema.parse(toAuthState(user)));
}