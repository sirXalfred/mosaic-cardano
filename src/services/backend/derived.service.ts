import { z } from 'zod';

import { CommunityNodeSchema, type CommunityNode } from '@/types/schemas';
import { cacheAside, cacheKey, invalidateCachePattern } from './cache';
import { runRead } from './shared';

const listInput = z.object({
	limit: z.number().int().positive().max(100).default(10),
});

const recommendationsInput = z.object({
	userId: z.string().uuid(),
	limit: z.number().int().positive().max(100).default(10),
});

export const derivedService = {
	async getTrendingCommunities(limit = 10): Promise<CommunityNode[]> {
		const parsed = listInput.parse({ limit });
		const key = cacheKey('derived', 'trending', parsed.limit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (c:Mosaic_Community)
						OPTIONAL MATCH (c)<-[:MEMBER_OF]-(members:Mosaic_User)
						OPTIONAL MATCH (c)-[:HOSTS]->(:Mosaic_Project)-[:CONTAINS]->(a:Mosaic_Piece)
						WITH c, count(DISTINCT members) AS memberCount, count(DISTINCT a) AS artifactCount
						RETURN c AS community, (memberCount * 3 + artifactCount) AS score
						ORDER BY score DESC, c.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{ limit: parsed.limit },
					row => CommunityNodeSchema.parse(row.community),
				);
			},
			120,
		);
	},

	async getRecommendedCommunities(userId: string, limit = 10): Promise<CommunityNode[]> {
		const parsed = recommendationsInput.parse({ userId, limit });
		const key = cacheKey('derived', 'recommended', parsed.userId, parsed.limit);

		return cacheAside(
			key,
			async () => {
				return runRead(
					`
						MATCH (u:Mosaic_User {id: $userId})

						OPTIONAL MATCH (u)-[:HAS_SKILL]->(skill:Mosaic_Skill)<-[:HAS_SKILL]-(:Mosaic_User)-[:MEMBER_OF]->(candidate:Mosaic_Community)
						WHERE NOT (u)-[:MEMBER_OF]->(candidate)
						WITH u, candidate, count(DISTINCT skill) AS skillOverlap

						OPTIONAL MATCH (u)-[:INTERESTED_IN]->(topic:Mosaic_Topic)<-[:TAGGED_WITH]-(:Mosaic_Piece)<-[:CONTAINS]-(:Mosaic_Project)<-[:HOSTS]-(candidate)
						WITH candidate, skillOverlap, count(DISTINCT topic) AS topicOverlap

						WHERE candidate IS NOT NULL
						RETURN candidate AS community, (skillOverlap * 2 + topicOverlap) AS score
						ORDER BY score DESC, candidate.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{
						userId: parsed.userId,
						limit: parsed.limit,
					},
					row => CommunityNodeSchema.parse(row.community),
				);
			},
			180,
		);
	},

	async getCommunitiesByTopics(topics: string[], limit = 10): Promise<CommunityNode[]> {
		const parsedTopics = z.array(z.string().trim().min(1)).parse(topics ?? []);
		const key = cacheKey('derived', 'byTopics', parsedTopics.join(','), limit);

		return cacheAside(
			key,
			async () => {
				// Communities with artifacts/projects tagged with the provided topics
				const topicMatches = await runRead(
					`
						MATCH (t:Mosaic_Topic)
						WHERE t.name IN $topics
						OPTIONAL MATCH (t)<-[:TAGGED_WITH]-(:Mosaic_Piece)<-[:CONTAINS]-(:Mosaic_Project)<-[:HOSTS]-(c:Mosaic_Community)
						WITH c, count(*) AS relevance
						WHERE c IS NOT NULL
						RETURN c AS community
						ORDER BY relevance DESC, c.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{ topics: parsedTopics, limit },
					row => CommunityNodeSchema.parse(row.community),
				);

				// Also include a small number of trending communities to diversify results
				const trending = await this.getTrendingCommunities(limit);

				const merged: CommunityNode[] = [];
				const seen = new Set<string>();
				for (const c of topicMatches) {
					if (!seen.has(c.id)) {
						seen.add(c.id);
						merged.push(c);
					}
				}
				for (const c of trending) {
					if (!seen.has(c.id)) {
						seen.add(c.id);
						merged.push(c);
					}
				}

				return merged.slice(0, limit);
			},
			120,
		);
	},

	async invalidateDerived(): Promise<void> {
		await invalidateCachePattern(cacheKey('derived', '*'));
	},
};

