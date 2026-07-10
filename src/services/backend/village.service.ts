import { z } from 'zod';

import { JoinCommunityRequestSchema, LeaveCommunityRequestSchema } from '@/types/api';
import { CommunityNodeSchema, UserNodeSchema, type CommunityNode, type UserNode } from '@/types/schemas';
import { cacheAside, cacheAsideWithLock, cacheKey, invalidateCachePattern } from './cache';
import { runRead, runWrite } from './shared';



const listVillagesInput = z.object({
	limit: z.number().int().positive().max(100).default(10),
});

export type VillageSummary = {
	id: string;
	name: string;
	description: string | null;
	memberCount: number;
	profileImageUrl: string | null;
};

export const villageService = {
	async createCommunity(userId: string, input: { name: string; description?: string; tags?: string[]; profileImageUrl?: string | null }): Promise<CommunityNode> {
		const parsedUserId = z.string().uuid().parse(userId);

		const currentVillageCount = await runRead(
			`
				MATCH (u:Mosaic_User {id: $userId})-[m:MEMBER_OF {role: 'ADMIN'}]->(c:Mosaic_Community)
				WHERE coalesce(c.isDeleted, false) = false
				RETURN count(c) as count
			`,
			{ userId: parsedUserId },
			row => Number(row.count ?? 0)
		);

		const userPlan = await runRead(
			`MATCH (u:Mosaic_User {id: $userId}) RETURN u.planType as planType`,
			{ userId: parsedUserId },
			row => String(row.planType || 'FREE')
		);

		const maxVillages = ['PRO', 'CUSTOM'].includes(userPlan[0]) ? Infinity : userPlan[0] === 'BASIC' ? 10 : 1;
		if (currentVillageCount[0] >= maxVillages) {
			throw new Error('PLAN_LIMIT: Upgrade your plan to create more communities.');
		}

		const id = crypto.randomUUID();
		const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		const now = Date.now();

		const rows = await runWrite(
			`
				MERGE (c:Mosaic_Community {slug: $slug})
				ON CREATE SET
					c.id = $id,
					c.name = $name,
					c.description = $description,
					c.profileImageUrl = $profileImageUrl,
					c.createdAt = $now
				WITH c
				MATCH (u:Mosaic_User {id: $userId})
				MERGE (u)-[m:MEMBER_OF]->(c)
				ON CREATE SET m.joinedAt = $now, m.role = 'ADMIN'
				RETURN c AS community
			`,
			{
				id,
				slug,
				name: input.name,
				description: input.description ?? null,
				profileImageUrl: input.profileImageUrl ?? null,
				userId: parsedUserId,
				now,
			},
			row => CommunityNodeSchema.parse(row.community),
		);

		if (!rows[0]) throw new Error('Failed to create community');

		await invalidateCachePattern(cacheKey('community', 'featured', '*'));
		await invalidateCachePattern(cacheKey('community', 'mine', parsedUserId, '*'));

		// Award early-adopter badge asynchronously if in beta
		if (process.env.NEXT_PUBLIC_APP_STAGE !== 'production') {
			import('./badge.service').then(({ badgeService }) => {
				badgeService.createUnclaimedBadge(parsedUserId, 'early-adopter', `ea-${parsedUserId}`).catch(console.error);
			}).catch(console.error);
		}

		return rows[0];
	},

	async deleteCommunity(userId: string, communityId: string): Promise<void> {
		const parsedUserId = z.string().uuid().parse(userId);
		const parsedCommunityId = z.string().uuid().parse(communityId);
		const now = Date.now();

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})-[m:MEMBER_OF]->(c:Mosaic_Community {id: $communityId})
				WHERE m.role = 'ADMIN'
				DETACH DELETE c
			`,
			{ userId: parsedUserId, communityId: parsedCommunityId, now },
			() => { }
		);

		await Promise.all([
			invalidateCachePattern(cacheKey('community', parsedCommunityId, '*')),
			invalidateCachePattern(cacheKey('community', 'featured', '*')),
			invalidateCachePattern(cacheKey('community', 'mine', parsedUserId, '*')),
		]);
	},

	async checkCommunityMembership(userId: string, communityId: string): Promise<{ isMember: boolean; role: string | null; isCreator: boolean }> {
		const parsedUserId = z.string().uuid().parse(userId);
		const parsedCommunityId = z.string().uuid().parse(communityId);

		const rows = await runRead(
			`
				MATCH (u:Mosaic_User {id: $userId})
				OPTIONAL MATCH (u)-[membership:MEMBER_OF]->(:Mosaic_Community {id: $communityId})
				RETURN count(membership) > 0 AS isMember, head(collect(membership.role)) AS role
			`,
			{
				userId: parsedUserId,
				communityId: parsedCommunityId,
			},
			row => {
				const role = (row.role as string | null) ?? null;
				return {
					isMember: Boolean(row.isMember),
					role,
					isCreator: role === 'ADMIN',
				};
			},
		);

		return rows[0] ?? { isMember: false, role: null, isCreator: false };
	},

	async joinCommunity(input: z.infer<typeof JoinCommunityRequestSchema>): Promise<void> {
		const parsed = JoinCommunityRequestSchema.parse(input);
		const now = Date.now();

		const limitCheck = await runRead(
			`
			MATCH (c:Mosaic_Community {id: $communityId})<-[:MEMBER_OF {role: 'ADMIN'}]-(creator:Mosaic_User)
			OPTIONAL MATCH (c)<-[:MEMBER_OF]-(member:Mosaic_User)

			RETURN creator.planType AS planType, count(member) AS memberCount
			LIMIT 1
			`,
			{ communityId: parsed.communityId },
			row => ({ planType: String(row.planType || 'FREE'), memberCount: Number(row.memberCount ?? 0) })
		);

		if (limitCheck[0]) {
			const { planType, memberCount } = limitCheck[0];
			const maxMembers = planType === 'PRO' ? 500 : planType === 'CUSTOM' ? Infinity : 50;

			if (memberCount >= maxMembers) {
				throw new Error('VILLAGE_FULL: This village has reached its member limit for its current plan.');
			}
		}

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				MATCH (c:Mosaic_Community {id: $communityId})

				MERGE (u)-[m:MEMBER_OF]->(c)

				ON CREATE SET
					m.joinedAt = $now,
					m.role = 'MEMBER',
					m.joinMethod = CASE
						WHEN $inviterId IS NULL THEN 'DIRECT'
						ELSE 'INVITE'
					END,
					m.inviterId = $inviterId

				RETURN c.id AS communityId
			`,
			{
				userId: parsed.userId,
				communityId: parsed.communityId,
				now,
				inviterId: parsed.inviterId ?? null,
			},
			row => row.communityId,
		);

		await Promise.all([
			invalidateCachePattern(cacheKey('community', parsed.communityId, '*')),
			invalidateCachePattern(cacheKey('derived', 'recommended', parsed.userId, '*')),
			invalidateCachePattern(cacheKey('derived', 'trending', '*')),
		]);
	},

	async leaveCommunity(input: z.infer<typeof LeaveCommunityRequestSchema>): Promise<void> {
		const parsed = LeaveCommunityRequestSchema.parse(input);

		await runWrite(
			`
				MATCH (:Mosaic_User {id: $userId})-[m:MEMBER_OF]->(:Mosaic_Community {id: $communityId})
				DELETE m
				RETURN $communityId AS communityId
			`,
			{
				userId: parsed.userId,
				communityId: parsed.communityId,
			},
			row => row.communityId,
		);

		await Promise.all([
			invalidateCachePattern(cacheKey('community', parsed.communityId, '*')),
			invalidateCachePattern(cacheKey('derived', 'recommended', parsed.userId, '*')),
			invalidateCachePattern(cacheKey('derived', 'trending', '*')),
		]);
	},

	async getCommunityByIdOrSlug(idOrSlug: string): Promise<CommunityNode | null> {
		const key = cacheKey('community', idOrSlug, 'details');

		return cacheAside(
			key,
			async () => {
				const rows = await runRead(
					`
						MATCH (c:Mosaic_Community)
						WHERE (c.id = $idOrSlug OR c.slug = $idOrSlug) AND coalesce(c.isDeleted, false) = false
						RETURN c AS community
						LIMIT 1
					`,
					{ idOrSlug },
					row => CommunityNodeSchema.parse(row.community),
				);

				return rows[0] ?? null;
			},
			120,
		);
	},

	async updateVillageSettings(userId: string, communityId: string, input: { description?: string; profileImageUrl?: string; isPublic?: boolean }): Promise<void> {
		const parsedUserId = z.string().uuid().parse(userId);
		const parsedCommunityId = z.string().uuid().parse(communityId);
		const now = Date.now();

		await runWrite(
			`
				MATCH (u:User {id: $userId})-[m:MEMBER_OF]->(c:Community {id: $communityId})
				WHERE m.role = 'ADMIN'
				
				SET 
					c.description = coalesce($description, c.description),
					c.profileImageUrl = coalesce($profileImageUrl, c.profileImageUrl),
					c.isPublic = coalesce($isPublic, c.isPublic)
					
				CREATE (c)-[:HAS_ACTIVITY]->(a:CommunityActivity {
					id: randomUUID(),
					type: 'SETTINGS_UPDATED',
					description: 'Community settings were updated by admin.',
					createdAt: $now
				})
			`,
			{
				userId: parsedUserId,
				communityId: parsedCommunityId,
				description: input.description ?? null,
				profileImageUrl: input.profileImageUrl ?? null,
				isPublic: input.isPublic ?? null,
				now,
			},
			() => { } // Empty mapRow since we don't need a return value
		);

		await invalidateCachePattern(cacheKey('community', parsedCommunityId, '*'));
		// Also invalidate slug-based details just in case
		await invalidateCachePattern(cacheKey('community', '*', 'details'));
	},

	async getVillageActivityLog(communityId: string, limit = 20) {
		const parsedCommunityId = z.string().uuid().parse(communityId);
		const key = cacheKey('community', parsedCommunityId, 'activity', limit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						CALL {
							MATCH (u:Mosaic_User)-[:AUTHORED]->(p:Mosaic_Post)-[:POSTED_IN]->(c:Mosaic_Community {id: $communityId})
							RETURN p.id AS id, 'POST' AS type, coalesce(u.displayName, u.name, u.username) + ' posted a message.' AS description, p.createdAt AS createdAt
							UNION
							MATCH (u:Mosaic_User)<-[:CREATED_BY]-(p:Mosaic_Piece)-[:PUBLISHED_IN]->(c:Mosaic_Community {id: $communityId})
							WHERE p.status = 'Published'
							RETURN p.id AS id, 'PIECE' AS type, coalesce(u.displayName, u.name, u.username) + ' published a piece: "' + p.title + '".' AS description, p.updatedAt AS createdAt
							UNION
							MATCH (u:Mosaic_User)-[m:MEMBER_OF]->(c:Mosaic_Community {id: $communityId})
							RETURN u.id + '_' + m.joinedAt AS id, 'JOIN' AS type, coalesce(u.displayName, u.name, u.username) + ' joined the community.' AS description, m.joinedAt AS createdAt
							UNION
							MATCH (c:Mosaic_Community {id: $communityId})-[:HAS_ACTIVITY]->(a:Mosaic_CommunityActivity)
							RETURN a.id AS id, a.type AS type, a.description AS description, a.createdAt AS createdAt
						}
						RETURN id, type, description, createdAt
						ORDER BY createdAt DESC
						LIMIT toInteger($limit)
					`,
					{ communityId: parsedCommunityId, limit },
					row => ({
						id: row.id as string,
						type: row.type as string,
						description: row.description as string,
						createdAt: Number(row.createdAt),
					}),
				);
			},
			30,
		);
	},

	async removeCommunityMembers(adminId: string, communityId: string, memberIds: string[]): Promise<void> {
		const parsedAdminId = z.string().uuid().parse(adminId);
		const parsedCommunityId = z.string().uuid().parse(communityId);
		const parsedMemberIds = memberIds.map(id => z.string().uuid().parse(id));
		const now = Date.now();

		await runWrite(
			`
				MATCH (admin:Mosaic_User {id: $adminId})-[adminMember:MEMBER_OF]->(c:Mosaic_Community {id: $communityId})
				WHERE adminMember.role = 'ADMIN'
				WITH c, admin

				MATCH (u:Mosaic_User)-[m:MEMBER_OF]->(c)
				WHERE u.id IN $memberIds AND u.id <> $adminId
				
				CREATE (u)-[r:WAS_REMOVED {
					removedAt: $now,
					removedBy: $adminId,
					joinedAt: m.joinedAt
				}]->(c)
				DELETE m
				
				CREATE (c)-[:HAS_ACTIVITY]->(a:CommunityActivity {
					id: randomUUID(),
					type: 'MEMBERS_REMOVED',
					description: 'Admin removed ' + size($memberIds) + ' members.',
					createdAt: $now
				})
			`,
			{
				adminId: parsedAdminId,
				communityId: parsedCommunityId,
				memberIds: parsedMemberIds,
				now
			},
			() => { }
		);

		await invalidateCachePattern(cacheKey('community', parsedCommunityId, '*'));
	},

	async listCommunityMembers(idOrSlug: string, limit = 50): Promise<UserNode[]> {
		const key = cacheKey('community', idOrSlug, 'members', limit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (c:Mosaic_Community)
						WHERE (c.id = $idOrSlug OR c.slug = $idOrSlug) AND coalesce(c.isDeleted, false) = false
						MATCH (u:Mosaic_User)-[:MEMBER_OF]->(c)
						RETURN u AS user
						ORDER BY u.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{
						idOrSlug,
						limit,
					},
					row => UserNodeSchema.parse(row.user),
				);
			},
			60,
		);
	},

	async listFeaturedVillages(limit = 10): Promise<VillageSummary[]> {
		const parsed = listVillagesInput.parse({ limit });
		const key = cacheKey('community', 'featured', parsed.limit);

		return cacheAsideWithLock(
			key,
			async () => {
				return runRead(
					`
						MATCH (c:Mosaic_Community)
						WHERE coalesce(c.isDeleted, false) = false
						OPTIONAL MATCH (c)<-[:MEMBER_OF]-(member:Mosaic_User)
						WITH c, count(DISTINCT member) AS memberCount
						RETURN c AS community, memberCount AS memberCount
						ORDER BY memberCount DESC, c.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{ limit: parsed.limit },
					row => {
						const community = CommunityNodeSchema.parse(row.community);
						return {
							id: community.id,
							name: community.name,
							description: community.description ?? null,
							memberCount: Number(row.memberCount ?? 0),
							profileImageUrl: community.profileImageUrl ?? null,
						} satisfies VillageSummary;
					},
				);
			},
			172800,
		);
	},

	async listUserVillages(userId: string, limit = 20): Promise<VillageSummary[]> {
		const parsedUserId = z.string().uuid().parse(userId);
		const parsedLimit = z.number().int().positive().max(100).default(20).parse(limit);
		const key = cacheKey('community', 'mine', parsedUserId, parsedLimit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (u:Mosaic_User {id: $userId})-[:MEMBER_OF]->(c:Mosaic_Community)
						WHERE coalesce(c.isDeleted, false) = false
						OPTIONAL MATCH (c)<-[:MEMBER_OF]-(member:Mosaic_User)
						WITH c, count(DISTINCT member) AS memberCount
						RETURN c AS community, memberCount AS memberCount
						ORDER BY c.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{ userId: parsedUserId, limit: parsedLimit },
					row => {
						const community = CommunityNodeSchema.parse(row.community);
						return {
							id: community.id,
							name: community.name,
							description: community.description ?? null,
							memberCount: Number(row.memberCount ?? 0),
							profileImageUrl: community.profileImageUrl ?? null,
						} satisfies VillageSummary;
					},
				);
			},
			120,
		);
	},
};

