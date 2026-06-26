import { runRead, runWrite } from "./shared";

export interface MosaicBadge {
    id: string;
    type: string;
    status: 'UNCLAIMED' | 'CLAIMED';
    policyId?: string;
    assetNameHex?: string;
    assetNameBase?: string;
    txHash?: string;
    createdAt: string;
    claimedAt?: string;
}

export const badgeService = {
    async getUserBadges(userId: string): Promise<MosaicBadge[]> {
        return runRead(
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
                    .createdAt,
                    .claimedAt
                } as badge
                ORDER BY b.createdAt DESC
            `,
            { userId },
            row => row.badge as MosaicBadge
        );
    },

    async createUnclaimedBadge(userId: string, badgeType: string, badgeId: string): Promise<void> {
        await runWrite(
            `
                MATCH (u:Mosaic_User {id: $userId})
                MERGE (u)-[:HAS_BADGE]->(b:Mosaic_Badge {type: $badgeType})
                ON CREATE SET 
                    b.id = $badgeId,
                    b.status = 'UNCLAIMED',
                    b.createdAt = datetime().toString()
            `,
            { userId, badgeType, badgeId },
            () => null
        );
    },

    async markBadgeClaimed(userId: string, badgeId: string, policyId: string, assetNameHex: string, assetNameBase: string, txHash: string): Promise<void> {
        await runWrite(
            `
                MATCH (u:Mosaic_User {id: $userId})-[:HAS_BADGE]->(b:Mosaic_Badge {id: $badgeId})
                SET b.status = 'CLAIMED',
                    b.policyId = $policyId,
                    b.assetNameHex = $assetNameHex,
                    b.assetNameBase = $assetNameBase,
                    b.txHash = $txHash,
                    b.claimedAt = datetime().toString()
            `,
            { userId, badgeId, policyId, assetNameHex, assetNameBase, txHash },
            () => null
        );
    }
};


