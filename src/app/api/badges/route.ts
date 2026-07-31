import { NextResponse } from 'next/server';
import { badgeService } from '@/services/backend/badge.service';
import { authService } from '@/services/backend/auth.service';
import type { BadgeMetadata } from '@/lib/blockchain/minting';
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
import { badgeQueue } from '@/lib/queue';
import { validatePayload } from '@/lib/backend/api-validation';

export const POST = withAuth(async (req, context, userId) => {
    try {
        const body = await req.json();
        const validation = await validatePayload(ClaimSchema, body);
        if (!validation.success) return validation.response;

        const { badgeId } = validation.data;

        // Verify the user owns this badge and it is UNCLAIMED
        const badges = await badgeService.getUserBadges(userId);
        const badge = badges.find(b => b.id === badgeId);

        if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
        if (badge.status === 'CLAIMED') return NextResponse.json({ error: "Badge already claimed" }, { status: 400 });
        if (badge.status === 'MINTING') return NextResponse.json({ message: "Badge minting already in progress", status: 'MINTING' }, { status: 202 });

        // Get user's wallet address
        const settings = await authService.getUserSettings(userId);
        if (!settings?.walletAddress) {
            return NextResponse.json({ error: "You must link a Cardano wallet before claiming badges." }, { status: 400 });
        }

        const imageUri = BADGE_ASSETS[badge.type] || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/assets/images/logo.png`;

        // Prepare dynamic metadata based on badge type
        const metadata: BadgeMetadata = {
            name: `Mosaic ${badge.type} Badge`,
            image: imageUri,
            description: `Awarded to ${badge.type} contributors of Mosaic.`,
            unlockedAt: new Date(badge.createdAt).toISOString(),
            badgeType: badge.type
        };

        if (badge.type === 'early-adopter') {
            metadata.villageCreated = 'true';
        } else if (badge.type === 'first-post') {
            metadata.postPublished = 'true';
        } else if (badge.type === 'first-feedback') {
            metadata.feedbackProvided = 'true';
        } else if (badge.type === 'first-invite') {
            metadata.inviteSent = 'true';
        } else if (badge.type === 'first-document') {
            metadata.documentPublished = 'true';
        } else if (badge.type === 'early-user') {
            metadata.onboarded = 'true';
        } else if (badge.type === 'test-badge') {
            metadata.isTestBadge = 'true';
        }

        // 1. Mark status as MINTING in Neo4j database
        await badgeService.markBadgeMinting(userId, badge.id);

        // 2. Queue job in BullMQ for background worker execution
        await badgeQueue.add('mint-badge', {
            userId,
            badgeId: badge.id,
            badgeType: badge.type,
            walletAddress: settings.walletAddress,
            metadata
        });

        // 3. Return 202 Accepted status immediately
        return NextResponse.json(
            { message: "Badge minting queued successfully", status: 'MINTING', badgeId: badge.id },
            { status: 202 }
        );
    } catch (error: unknown) {
        console.error('Failed to claim badge:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to claim badge" }, { status: 500 });
    }
});
