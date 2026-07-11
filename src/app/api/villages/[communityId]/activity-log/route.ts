import { NextResponse } from 'next/server';
import { villageService } from '@/services/backend/village.service';
import { withAuth } from '@/lib/backend/request';


/**
 * @swagger
 * /api/villages/[communityId]/activity-log:
 *   get:
 *     summary: GET activity-log
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
export const GET = withAuth(async (req, { params }) => {
  try {
    const communityId = params.communityId;

    const details = await villageService.getCommunityByIdOrSlug(communityId);
    if (!details) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const activity = await villageService.getVillageActivityLog(details.id);

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Failed to fetch activity log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
