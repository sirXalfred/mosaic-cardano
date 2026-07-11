import { NextResponse } from 'next/server';

import { OnboardingRequestSchema } from '@/types/api';
import { onboardingService } from '@/services/backend/onboarding.service';
import { withAuth } from '@/lib/backend/request';

export const runtime = 'nodejs';


/**
 * @swagger
 * /api/onboarding:
 *   post:
 *     summary: POST onboarding
 *     tags: [api]
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const POST = withAuth(async (request, context, userId) => {
  try {
    const body = await request.json();
    const parsed = OnboardingRequestSchema.parse({ ...body, userId });

    const user = await onboardingService.completeOnboarding(parsed);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onboarding failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
