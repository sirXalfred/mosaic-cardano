import { NextResponse } from 'next/server';
import { z } from 'zod';
import { villageService } from '@/services/backend/village.service';
import { withAuth } from '@/lib/backend/request';


/**
 * @swagger
 * /api/villages/[communityId]/settings:
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
export const GET = withAuth(async (req, { params }, userId) => {
  try {
    const communityId = params.communityId;

    const details = await villageService.getCommunityByIdOrSlug(communityId);
    if (!details) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const membership = await villageService.checkCommunityMembership(userId, details.id);

    return NextResponse.json({
      ...details,
      isMember: membership.isMember,
      isCreator: membership.isCreator,
      role: membership.role
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

const UpdateSettingsSchema = z.object({
  description: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  isPublic: z.boolean().optional()
});


/**
 * @swagger
 * /api/villages/[communityId]/settings:
 *   patch:
 *     summary: PATCH settings
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
export const PATCH = withAuth(async (req, { params }, userId) => {
  try {
    const communityId = params.communityId;
    
    // Resolve slug to ID
    const details = await villageService.getCommunityByIdOrSlug(communityId);
    if (!details) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const membership = await villageService.checkCommunityMembership(userId, details.id);
    if (!membership.isCreator) {
      return NextResponse.json({ error: 'Forbidden. Only admins can update settings.' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateSettingsSchema.parse(body);

    await villageService.updateVillageSettings(userId, details.id, parsed);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
