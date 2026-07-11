import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { authService } from '@/services/backend/auth.service';

export const runtime = 'nodejs';


/**
 * @swagger
 * /api/users/me/settings:
 *   get:
 *     summary: GET settings
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
export const GET = withAuth(async (request, context, userId) => {
  try {
    const settings = await authService.getUserSettings(userId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
