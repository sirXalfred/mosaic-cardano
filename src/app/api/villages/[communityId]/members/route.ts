import { NextResponse } from 'next/server';
import { villageService } from '@/services/backend/village.service';
import { withAuth } from '@/lib/backend/request';


/**
 * @swagger
 * /api/villages/[communityId]/members:
 *   get:
 *     summary: GET members
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

    const members = await villageService.listCommunityMembers(details.id);

    return NextResponse.json(members);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});


/**
 * @swagger
 * /api/villages/[communityId]/members:
 *   delete:
 *     summary: DELETE members
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
export const DELETE = withAuth(async (req, { params }, adminId) => {
  try {
    const communityId = params.communityId;

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const memberIds = body.memberIds;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: 'Invalid memberIds' }, { status: 400 });
    }

    await villageService.removeCommunityMembers(adminId, communityId, memberIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove members:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
