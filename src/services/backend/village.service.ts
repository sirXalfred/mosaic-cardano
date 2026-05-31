import { z } from 'zod';

import { JoinCommunityRequestSchema, LeaveCommunityRequestSchema } from '@/types/api';
import { CommunityNodeSchema, UserNodeSchema, type CommunityNode, type UserNode } from '@/types/schemas';
import { cacheAside, cacheKey, invalidateCachePattern } from './cache';
import { runRead, runWrite } from './shared';

const listMembersInput = z.object({
	communityId: z.string().uuid(),
	limit: z.number().int().positive().max(200).default(50),
});

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
	async joinCommunity(input: z.infer<typeof JoinCommunityRequestSchema>): Promise<void> {
		const parsed = JoinCommunityRequestSchema.parse(input);
		const now = Date.now();

		await runWrite(
			`
				MATCH (u:User {id: $userId})
				MATCH (c:Community {id: $communityId})
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
				MATCH (:User {id: $userId})-[m:MEMBER_OF]->(:Community {id: $communityId})
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

	async getCommunityById(communityId: string): Promise<CommunityNode | null> {
		const parsedCommunityId = z.string().uuid().parse(communityId);
		const key = cacheKey('community', parsedCommunityId, 'details');

		return cacheAside(
			key,
			async () => {
				const rows = await runRead(
					`
						MATCH (c:Community {id: $communityId})
						RETURN c AS community
						LIMIT 1
					`,
					{ communityId: parsedCommunityId },
					row => CommunityNodeSchema.parse(row.community),
				);

				return rows[0] ?? null;
			},
			120,
		);
	},

	async listCommunityMembers(communityId: string, limit = 50): Promise<UserNode[]> {
		const parsed = listMembersInput.parse({ communityId, limit });
		const key = cacheKey('community', parsed.communityId, 'members', parsed.limit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (u:User)-[:MEMBER_OF]->(:Community {id: $communityId})
						RETURN u AS user
						ORDER BY u.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{
						communityId: parsed.communityId,
						limit: parsed.limit,
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
						MATCH (c:Community)
						OPTIONAL MATCH (c)<-[:MEMBER_OF]-(member:User)
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
						MATCH (u:User {id: $userId})-[:MEMBER_OF]->(c:Community)
						OPTIONAL MATCH (c)<-[:MEMBER_OF]-(member:User)
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

