import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/backend/request';
import { authService } from '@/services/backend/auth.service';

export const runtime = 'nodejs';


/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: PATCH me
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
export const PATCH = withAuth(async (request, context, userId) => {
  try {
    const body = await request.json();
    const { displayName, bio } = body;

    const user = await authService.updateProfile({
      userId,
      displayName,
      bio,
    });

    return NextResponse.json({
      id: user.id,
      displayName: user.displayName,
      handle: `@${user.username}`,
      bio: user.bio,
      joinedDate: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isVerified: user.isVerified,
      walletAddress: user.walletAddress,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
