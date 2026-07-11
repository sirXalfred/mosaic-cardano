import { NextResponse } from 'next/server';
import { badgeService } from '@/services/backend/badge.service';
import { authService } from '@/services/backend/auth.service';
import { mintCIP68Badge, BadgeMetadata } from '@/lib/blockchain/minting';
import { z } from 'zod';
import { withAuth } from '@/lib/backend/request';
import { BADGE_ASSETS } from '@/lib/badges';


/**
 * @swagger
 * /api/badges:
 *   get:
 *     summary: GET badges
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
export const GET = withAuth(async (req, context, userId) => {
    try {
        const badges = await badgeService.getUserBadges(userId);
        return NextResponse.json({ badges });
    } catch (error) {
        console.error('Failed to fetch badges:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

const ClaimSchema = z.object({
    badgeId: z.string()
});


/**
 * @swagger
 * /api/badges:
 *   post:
 *     summary: POST badges
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
export const POST = withAuth(async (req, context, userId) => {
    try {
        const body = await req.json();
        const { badgeId } = ClaimSchema.parse(body);

        // Verify the user owns this badge and it is UNCLAIMED
        const badges = await badgeService.getUserBadges(userId);
        const badge = badges.find(b => b.id === badgeId);

        if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
        if (badge.status === 'CLAIMED') return NextResponse.json({ error: "Badge already claimed" }, { status: 400 });

        // Get user's wallet address
        const settings = await authService.getUserSettings(userId);
        if (!settings?.walletAddress) {
            return NextResponse.json({ error: "You must link a Cardano wallet before claiming badges." }, { status: 400 });
        }


        const imageUri = BADGE_ASSETS[badge.type] || 'ipfs://QmGenericBadge...';

        // Prepare dynamic metadata based on badge type
        const metadata: BadgeMetadata = {
            name: `Mosaic ${badge.type} Badge`,
            image: imageUri,
            description: `Awarded to ${badge.type} contributors of Mosaic.`,
            unlockedAt: new Date(badge.createdAt).toISOString(),
            badgeType: badge.type
        };

        if (badge.type === 'early-adopter') {
            metadata.villageCreated = true;
        } else if (badge.type === 'first-post') {
            metadata.postPublished = true;
        } else if (badge.type === 'first-feedback') {
            metadata.feedbackProvided = true;
        } else if (badge.type === 'first-invite') {
            metadata.inviteSent = true;
        } else if (badge.type === 'first-document') {
            metadata.documentPublished = true;
        } else if (badge.type === 'early-user') {
            metadata.onboarded = true;
        }

        const { txHash, policyId, assetNameHex, assetNameBase } = await mintCIP68Badge(
            settings.walletAddress,
            badge.type,
            badge.id,
            metadata
        );

        // Mark as claimed
        await badgeService.markBadgeClaimed(userId, badge.id, policyId, assetNameHex, assetNameBase, txHash);

        return NextResponse.json({ txHash, policyId, assetNameBase, assetNameHex });
    } catch (error: unknown) {
        console.error('Failed to claim badge:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to claim badge" }, { status: 500 });
    }
});
