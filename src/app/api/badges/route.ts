import { NextRequest, NextResponse } from 'next/server';
import { getAuthSessionByToken } from '@/lib/backend/session';
import { badgeService } from '@/services/backend/badge.service';
import { authService } from '@/services/backend/auth.service';
import { mintCIP68Badge } from '@/lib/blockchain/minting';
import { z } from 'zod';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('mosaic_session')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const session = await getAuthSessionByToken(token);
        if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

        const badges = await badgeService.getUserBadges(session.userId);
        return NextResponse.json({ badges });
    } catch (error) {
        console.error('Failed to fetch badges:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

const ClaimSchema = z.object({
    badgeId: z.string()
});

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('mosaic_session')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const session = await getAuthSessionByToken(token);
        if (!session) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

        const body = await req.json();
        const { badgeId } = ClaimSchema.parse(body);

        // Verify the user owns this badge and it is UNCLAIMED
        const badges = await badgeService.getUserBadges(session.userId);
        const badge = badges.find(b => b.id === badgeId);

        if (!badge) return NextResponse.json({ error: "Badge not found" }, { status: 404 });
        if (badge.status === 'CLAIMED') return NextResponse.json({ error: "Badge already claimed" }, { status: 400 });

        // Get user's wallet address
        const settings = await authService.getUserSettings(session.userId);
        if (!settings?.walletAddress) {
            return NextResponse.json({ error: "You must link a Cardano wallet before claiming badges." }, { status: 400 });
        }

        // We'll prepare dummy metadata for now based on badge type
        // In a real app, we'd query exact stats
        const metadata = {
            name: `Mosaic ${badge.type} Badge`,
            image: "ipfs://QmDummyImageHash...",
            description: `Awarded to ${badge.type} contributors of Mosaic.`,
            villagesCreated: 1, // dynamically calculated in real scenario
            projectsJoined: 0,
            totalDonations: 0,
            unlockedAt: badge.createdAt,
            badgeType: badge.type
        };

        const { txHash, policyId, assetNameHex, assetNameBase } = await mintCIP68Badge(
            settings.walletAddress,
            badge.type,
            badge.id,
            metadata
        );

        // Mark as claimed
        await badgeService.markBadgeClaimed(session.userId, badge.id, policyId, assetNameHex, assetNameBase, txHash);

        return NextResponse.json({ txHash, policyId, assetNameBase, assetNameHex });
    } catch (error: unknown) {
        console.error('Failed to claim badge:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to claim badge" }, { status: 500 });
    }
}
