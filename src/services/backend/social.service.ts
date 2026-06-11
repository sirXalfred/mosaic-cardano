import { z } from 'zod';

import { FollowUserRequestSchema, UnfollowUserRequestSchema } from '@/types/api';
import { UserNodeSchema, type UserNode } from '@/types/schemas';
import { cacheAside, cacheKey, invalidateCachePattern } from './cache';
import { runRead, runWrite } from './shared';

const listFollowersInput = z.object({
	userId: z.string().uuid(),
	limit: z.number().int().positive().max(100).default(20),
});

export const socialService = {
	async followUser(input: z.infer<typeof FollowUserRequestSchema>): Promise<void> {
		const parsed = FollowUserRequestSchema.parse(input);
		const now = Date.now();

		await runWrite(
			`
				MATCH (follower:Mosaic_User {id: $followerId})
				MATCH (target:Mosaic_User {id: $targetUserId})
				MERGE (follower)-[r:FOLLOWS]->(target)
				ON CREATE SET r.createdAt = $now, r.isMuted = false
				RETURN follower.id AS followerId
			`,
			{
				followerId: parsed.followerId,
				targetUserId: parsed.targetUserId,
				now,
			},
			row => row.followerId,
		);

		await Promise.all([
			invalidateCachePattern(cacheKey('social', 'followers', parsed.targetUserId, '*')),
			invalidateCachePattern(cacheKey('social', 'following', parsed.followerId, '*')),
			invalidateCachePattern(cacheKey('derived', 'recommended', parsed.followerId, '*')),
		]);
	},

	async unfollowUser(input: z.infer<typeof UnfollowUserRequestSchema>): Promise<void> {
		const parsed = UnfollowUserRequestSchema.parse(input);

		await runWrite(
			`
				MATCH (:Mosaic_User {id: $followerId})-[r:FOLLOWS]->(:Mosaic_User {id: $targetUserId})
				DELETE r
				RETURN $followerId AS followerId
			`,
			{
				followerId: parsed.followerId,
				targetUserId: parsed.targetUserId,
			},
			row => row.followerId,
		);

		await Promise.all([
			invalidateCachePattern(cacheKey('social', 'followers', parsed.targetUserId, '*')),
			invalidateCachePattern(cacheKey('social', 'following', parsed.followerId, '*')),
			invalidateCachePattern(cacheKey('derived', 'recommended', parsed.followerId, '*')),
		]);
	},

	async setFollowMuted(followerId: string, targetUserId: string, isMuted: boolean): Promise<void> {
		const parsedFollowerId = z.string().uuid().parse(followerId);
		const parsedTargetUserId = z.string().uuid().parse(targetUserId);

		await runWrite(
			`
				MATCH (:Mosaic_User {id: $followerId})-[r:FOLLOWS]->(:Mosaic_User {id: $targetUserId})
				SET r.isMuted = $isMuted
				RETURN $followerId AS followerId
			`,
			{
				followerId: parsedFollowerId,
				targetUserId: parsedTargetUserId,
				isMuted,
			},
			row => row.followerId,
		);

		await invalidateCachePattern(cacheKey('social', 'following', parsedFollowerId, '*'));
	},

	async listFollowers(userId: string, limit = 20): Promise<UserNode[]> {
		const parsed = listFollowersInput.parse({ userId, limit });
		const key = cacheKey('social', 'followers', parsed.userId, parsed.limit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (u:Mosaic_User {id: $userId})<-[:FOLLOWS]-(follower:Mosaic_User)
						RETURN follower AS user
						ORDER BY follower.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{
						userId: parsed.userId,
						limit: parsed.limit,
					},
					row => UserNodeSchema.parse(row.user),
				);
			},
			60,
		);
	},
};

