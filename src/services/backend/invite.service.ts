import { z } from 'zod';
import { InviteNodeSchema, CommunityNodeSchema, UserNodeSchema, type InviteNode, type CommunityNode, type UserNode } from '@/types/schemas';
import { runRead, runWrite } from './shared';
import { badgeService } from './badge.service';

export const inviteService = {
	async createInvite(userId: string, communityId: string): Promise<InviteNode> {
		const parsedUserId = z.string().uuid().parse(userId);
		const parsedCommunityId = z.string().uuid().parse(communityId);
		const id = crypto.randomUUID();
		
		// Generate a random 8-character hex string as a hash
		const hash = crypto.randomUUID().split('-')[0];
		const now = Date.now();

		const rows = await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				MATCH (c:Mosaic_Community {id: $communityId})
				MERGE (i:Mosaic_Invite {communityId: $communityId, inviterId: $userId})
				ON CREATE SET
					i.id = $id,
					i.hash = $hash,
					i.createdAt = $now
				RETURN i AS invite
			`,
			{
				id,
				hash,
				userId: parsedUserId,
				communityId: parsedCommunityId,
				now,
			},
			row => InviteNodeSchema.parse(row.invite),
		);

		if (!rows[0]) throw new Error('Failed to create invite');

		badgeService.createUnclaimedBadge(parsedUserId, 'first-invite', `fi-${parsedUserId}`).catch(console.error);

		return rows[0];
	},

	async getInviteByHash(hash: string): Promise<{ invite: InviteNode; community: CommunityNode; inviter: UserNode } | null> {
		const parsedHash = z.string().min(1).parse(hash);

		const rows = await runRead(
			`
				MATCH (i:Mosaic_Invite {hash: $hash})
				MATCH (c:Mosaic_Community {id: i.communityId})
				MATCH (u:Mosaic_User {id: i.inviterId})
				RETURN i AS invite, c AS community, u AS inviter
				LIMIT 1
			`,
			{ hash: parsedHash },
			row => ({
				invite: InviteNodeSchema.parse(row.invite),
				community: CommunityNodeSchema.parse(row.community),
				inviter: UserNodeSchema.parse(row.inviter),
			}),
		);

		return rows[0] ?? null;
	},
    
    async acceptInvite(userId: string, hash: string): Promise<void> {
        const parsedUserId = z.string().uuid().parse(userId);
        const parsedHash = z.string().min(1).parse(hash);
        const now = Date.now();
        
        await runWrite(
            `
                MATCH (i:Mosaic_Invite {hash: $hash})
                MATCH (u:Mosaic_User {id: $userId})
                MATCH (inviter:Mosaic_User {id: i.inviterId})
                MATCH (c:Mosaic_Community {id: i.communityId})
                MERGE (u)-[m:MEMBER_OF]->(c)
                ON CREATE SET m.joinedAt = $now, m.role = 'MEMBER'
                MERGE (u)-[ib:INVITED_BY]->(inviter)
                ON CREATE SET ib.createdAt = $now
                RETURN c.id AS communityId
            `,
            {
                userId: parsedUserId,
                hash: parsedHash,
                now
            },
            row => row.communityId
        );
    }
};
