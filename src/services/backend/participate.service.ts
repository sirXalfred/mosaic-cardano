import { z } from 'zod';

import {
	CreateProjectRequestSchema,
	PublishPieceRequestSchema,
	type CreateProjectRequest,
	type PublishPieceRequest,
} from '@/types/api';
import { PieceNodeSchema, ProjectNodeSchema, type PieceNode, type ProjectNode } from '@/types/schemas';
import { cacheKey, invalidateCachePattern } from './cache';
import { runWrite } from './shared';

const ContributeInputSchema = z.object({
	userId: z.string().uuid(),
	projectId: z.string().uuid(),
	role: z.string().min(1).max(100),
});

export const participateService = {
	async createProject(input: CreateProjectRequest): Promise<ProjectNode> {
		const parsed = CreateProjectRequestSchema.parse(input);
		const now = Date.now();
		const projectId = crypto.randomUUID();

		const rows = await runWrite(
			`
				MATCH (owner:Mosaic_User {id: $ownerId})
				MATCH (community:Mosaic_Community {id: $communityId})
				CREATE (project:Mosaic_Project {
					id: $projectId,
					ownerId: $ownerId,
					communityId: $communityId,
					title: $title,
					description: $description,
					status: 'DRAFT',
					createdAt: $now
				})
				MERGE (owner)-[:CONTRIBUTED_TO {role: 'OWNER', createdAt: $now}]->(project)
				MERGE (community)-[:HOSTS]->(project)
				RETURN project AS project
			`,
			{
				projectId,
				ownerId: parsed.ownerId,
				communityId: parsed.communityId,
				title: parsed.title,
				description: parsed.description,
				now,
			},
			row => ProjectNodeSchema.parse(row.project),
		);

		const project = rows[0];
		await Promise.all([
			invalidateCachePattern(cacheKey('community', parsed.communityId, '*')),
			invalidateCachePattern(cacheKey('derived', 'trending', '*')),
		]);

		return project;
	},

	async publishPiece(input: PublishPieceRequest): Promise<PieceNode> {
		const parsed = PublishPieceRequestSchema.parse(input);
		const now = Date.now();
		const pieceId = crypto.randomUUID();

		const rows = await runWrite(
			`
				MATCH (author:Mosaic_User {id: $userId})
				MATCH (project:Mosaic_Project {id: $projectId})
				CREATE (piece:Mosaic_Piece {
					id: $pieceId,
					projectId: $projectId,
					authorId: $userId,
					title: $title,
					contentUrl: $contentUrl,
					contentType: $contentType,
					createdAt: $now
				})
				MERGE (project)-[:CONTAINS]->(piece)
				MERGE (author)-[:AUTHORED {createdAt: $now}]->(piece)
				RETURN piece AS piece
			`,
			{
				pieceId,
				userId: parsed.userId,
				projectId: parsed.projectId,
				title: parsed.pieceData.title,
				contentUrl: parsed.pieceData.contentUrl,
				contentType: parsed.pieceData.contentType ?? 'OTHER',
				now,
			},
			row => PieceNodeSchema.parse(row.piece),
		);

		const piece = rows[0];
		await Promise.all([
			invalidateCachePattern(cacheKey('community', '*')),
			invalidateCachePattern(cacheKey('derived', 'trending', '*')),
		]);

		return piece;
	},

	async contributeToProject(userId: string, projectId: string, role: string): Promise<void> {
		const parsed = ContributeInputSchema.parse({ userId, projectId, role });
		const now = Date.now();

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				MATCH (p:Mosaic_Project {id: $projectId})
				MERGE (u)-[r:CONTRIBUTED_TO]->(p)
				ON CREATE SET r.createdAt = $now
				SET r.role = $role
				RETURN p.id AS projectId
			`,
			{
				userId: parsed.userId,
				projectId: parsed.projectId,
				role: parsed.role,
				now,
			},
			row => row.projectId,
		);

		await Promise.all([
			invalidateCachePattern(cacheKey('community', '*')),
			invalidateCachePattern(cacheKey('derived', 'recommended', parsed.userId, '*')),
		]);
	},

	async contributeToPiece(userId: string, pieceId: string, role: string): Promise<void> {
		const parsed = ContributeInputSchema.parse({ userId, projectId: pieceId, role }); // Reusing schema for convenience
		const now = Date.now();

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				MATCH (p:Mosaic_Piece {id: $pieceId})
				MERGE (u)-[r:CONTRIBUTED_TO]->(p)
				ON CREATE SET r.createdAt = $now
				SET r.role = $role
			`,
			{
				userId: parsed.userId,
				pieceId: parsed.projectId, // mapped from schema validation
				role: parsed.role,
				now,
			},
			() => { },
		);
	},
};

