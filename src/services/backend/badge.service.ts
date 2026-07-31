import { runRead, runWrite } from "./shared";

export interface MosaicBadge {
    id: string;
    type: string;
    status: 'UNCLAIMED' | 'MINTING' | 'CLAIMED' | 'FAILED';
    policyId?: string;
    assetNameHex?: string;
    assetNameBase?: string;
    txHash?: string;
    isMainnet?: number;
    createdAt: string;
    claimedAt?: string;
}

export const badgeService = {
    async getUserBadges(userId: string): Promise<MosaicBadge[]> {
        const badges = await runRead(
            `
                MATCH (u:Mosaic_User {id: $userId})-[:HAS_BADGE]->(b:Mosaic_Badge)
                RETURN b {
                    .id,
                    .type,
                    .status,
                    .policyId,
                    .assetNameHex,
                    .assetNameBase,
                    .txHash,
                    .isMainnet,
                    .createdAt,
                    .claimedAt
                } as badge
                ORDER BY b.createdAt DESC
            `,
            { userId },
            row => row.badge as MosaicBadge
        );

        const isLive = process.env.NEXT_PUBLIC_IS_LIVE === 'true';
        const isDev = process.env.NODE_ENV === 'development';
        if (!isLive && isDev) {
            const hasTestBadge = badges.some(b => b.type === 'test-badge' && b.status !== 'CLAIMED');
            if (!hasTestBadge) {
                const testBadgeId = `test-badge-${userId}-${new Date().getTime()}`;
                await this.createUnclaimedBadge(userId, 'test-badge', testBadgeId);
                badges.unshift({
                    id: testBadgeId,
                    type: 'test-badge',
                    status: 'UNCLAIMED',
                    createdAt: new Date().toISOString()
                });
            }
        }

        return badges;
    },

    async createUnclaimedBadge(userId: string, badgeType: string, badgeId: string): Promise<void> {
        await runWrite(
            `
                MATCH (u:Mosaic_User {id: $userId})
                MERGE (u)-[:HAS_BADGE]->(b:Mosaic_Badge {type: $badgeType})
                ON CREATE SET 
                    b.id = $badgeId,
                    b.status = 'UNCLAIMED',
                    b.createdAt = $now
            `,
            { userId, badgeType, badgeId, now: new Date().toISOString() },
            () => null
        );
    },

    async markBadgeMinting(userId: string, badgeId: string): Promise<void> {
        await runWrite(
            `
                MATCH (u:Mosaic_User {id: $userId})-[:HAS_BADGE]->(b:Mosaic_Badge {id: $badgeId})
                SET b.status = 'MINTING',
                    b.mintingStartedAt = $now
            `,
            { userId, badgeId, now: new Date().toISOString() },
            () => null
        );
    },

    async markBadgeFailed(userId: string, badgeId: string): Promise<void> {
        await runWrite(
            `
                MATCH (u:Mosaic_User {id: $userId})-[:HAS_BADGE]->(b:Mosaic_Badge {id: $badgeId})
                SET b.status = 'UNCLAIMED'
            `,
            { userId, badgeId },
            () => null
        );
    },

    async markBadgeClaimed(userId: string, badgeId: string, policyId: string, assetNameHex: string, assetNameBase: string, txHash: string, isMainnet: number): Promise<void> {
        await runWrite(
            `
                MATCH (u:Mosaic_User {id: $userId})-[:HAS_BADGE]->(b:Mosaic_Badge {id: $badgeId})
                SET b.status = 'CLAIMED',
                    b.policyId = $policyId,
                    b.assetNameHex = $assetNameHex,
                    b.assetNameBase = $assetNameBase,
                    b.txHash = $txHash,
                    b.isMainnet = toInteger($isMainnet),
                    b.claimedAt = $now
            `,
            { userId, badgeId, policyId, assetNameHex, assetNameBase, txHash, isMainnet, now: new Date().toISOString() },
            () => null
        );
    }
};


