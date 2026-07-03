import { OnboardingRequestSchema, type OnboardingRequest } from '@/types/api';
import { type UserNode } from '@/types/schemas';
import { authService } from './auth.service';
import { badgeService } from './badge.service';
import { invalidateCacheKey, invalidateCachePattern, cacheKey } from './cache';
import { runWrite } from './shared';

const normalizeTags = (values: string[]): string[] => {
	return [...new Set(values.map(v => v.trim().toLowerCase()).filter(Boolean))];
};

export const onboardingService = {
	async completeOnboarding(input: OnboardingRequest): Promise<UserNode> {
		const parsed = OnboardingRequestSchema.parse(input);
		const now = Date.now();

		const skills = normalizeTags(parsed.skills);
		const topics = normalizeTags(parsed.topics);

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				SET u.isOnboarded = true, u.updatedAt = $now
				WITH u
				UNWIND $skills AS skillName
				MERGE (s:Mosaic_Skill {name: skillName})
				ON CREATE SET s.createdAt = $now
				MERGE (u)-[:HAS_SKILL {createdAt: $now}]->(s)

				WITH u
				UNWIND $topics AS topicName
				MERGE (t:Mosaic_Topic {name: topicName})
				ON CREATE SET t.createdAt = $now
				MERGE (u)-[:INTERESTED_IN {createdAt: $now}]->(t)
			`,
			{
				userId: parsed.userId,
				skills,
				topics,
				now,
			},
			() => null
		);

		if (parsed.communities && parsed.communities.length > 0) {
			await runWrite(
				`
					MATCH (u:Mosaic_User {id: $userId})
					UNWIND $communityIds AS communityId
					MATCH (c:Mosaic_Community {id: communityId})
					MERGE (u)-[m:MEMBER_OF]->(c)
					ON CREATE SET m.role = 'MEMBER', m.joinedAt = $now
				`,
				{
					userId: parsed.userId,
					communityIds: parsed.communities,
					now,
				},
				() => null
			);
		}

		const user = await authService.getUserById(parsed.userId);
		if (!user) {
			throw new Error('User not found while completing onboarding');
		}

		if (process.env.NEXT_PUBLIC_APP_STAGE !== 'production') {
			badgeService.createUnclaimedBadge(parsed.userId, 'early-user', `eu-${parsed.userId}`).catch(console.error);
		}

		await Promise.all([
			invalidateCacheKey(cacheKey('user', parsed.userId)),
			invalidateCachePattern(cacheKey('derived', 'recommended', parsed.userId, '*')),
			invalidateCachePattern(cacheKey('community', '*')),
		]);

		return user;
	},
};

