import { z } from 'zod';

import { JoinCommunityRequestSchema, LeaveCommunityRequestSchema } from '@/types/api';
import { CommunityNodeSchema, UserNodeSchema, type CommunityNode, type UserNode } from '@/types/schemas';
import { cacheAside, cacheKey, invalidateCachePattern } from './cache';
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
	async createCommunity(userId: string, input: { name: string; description?: string; tags?: string[] }): Promise<CommunityNode> {
		const parsedUserId = z.string().uuid().parse(userId);
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
				userId: parsedUserId,
				now,
			},
			row => CommunityNodeSchema.parse(row.community),
		);

		if (!rows[0]) throw new Error('Failed to create community');

		await invalidateCachePattern(cacheKey('community', 'featured', '*'));
		await invalidateCachePattern(cacheKey('community', 'mine', parsedUserId, '*'));

		return rows[0];
	},

	async checkCommunityMembership(userId: string, communityId: string): Promise<{ isMember: boolean; role: string | null }> {
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
			row => ({
				isMember: Boolean(row.isMember),
				role: (row.role as string | null) ?? null,
			}),
		);

		return rows[0] ?? { isMember: false, role: null };
	},

	async joinCommunity(input: z.infer<typeof JoinCommunityRequestSchema>): Promise<void> {
		const parsed = JoinCommunityRequestSchema.parse(input);
		const now = Date.now();

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				MATCH (c:Mosaic_Community {id: $communityId})
				MERGE (u)-[m:MEMBER_OF]->(c)
				ON CREATE SET m.joinedAt = $now, m.role = 'MEMBER'
				RETURN c.id AS communityId
			`,
			{
				userId: parsed.userId,
				communityId: parsed.communityId,
				now,
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
						WHERE c.id = $idOrSlug OR c.slug = $idOrSlug
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

	async listCommunityMembers(idOrSlug: string, limit = 50): Promise<UserNode[]> {
		const key = cacheKey('community', idOrSlug, 'members', limit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (c:Mosaic_Community)
						WHERE c.id = $idOrSlug OR c.slug = $idOrSlug
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

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (c:Mosaic_Community)
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
							profileImageUrl: null,
						} satisfies VillageSummary;
					},
				);
			},
			120,
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
							profileImageUrl: null,
						} satisfies VillageSummary;
					},
				);
			},
			120,
		);
	},
};

