import { NextResponse } from 'next/server';

import { OnboardingRequestSchema } from '@/types/api';
import { onboardingService } from '@/services/backend/onboarding.service';
import { getAuthSessionByToken, sessionCookieName } from '@/lib/backend/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map(part => part.trim())
      .find(part => part.startsWith(`${sessionCookieName}=`))
      ?.split('=')[1];

    const session = await getAuthSessionByToken(token ? decodeURIComponent(token) : undefined);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = OnboardingRequestSchema.parse({ ...body, userId: session.userId });

    const user = await onboardingService.completeOnboarding(parsed);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onboarding failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
