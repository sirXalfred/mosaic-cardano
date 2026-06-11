import { z } from 'zod';

import {
	CreateNotificationRequestSchema,
	NotificationsResponseSchema,
	PaginationQuerySchema,
	type CreateNotificationRequest,
	type NotificationsResponse,
} from '@/types/api';
import { NotificationNodeSchema, type NotificationNode } from '@/types/schemas';
import { cacheAside, cacheKey, invalidateCachePattern } from './cache';
import { runRead, runWrite } from './shared';

const markReadInput = z.object({
	userId: z.string().uuid(),
	notificationId: z.string().uuid(),
});

export const notificationService = {
	async createNotification(input: CreateNotificationRequest): Promise<NotificationNode> {
		const parsed = CreateNotificationRequestSchema.parse(input);
		const now = Date.now();
		const notificationId = crypto.randomUUID();

		const rows = await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				CREATE (n:Mosaic_Notification {
					id: $notificationId,
					userId: $userId,
					type: $type,
					title: $title,
					body: $body,
					isRead: false,
					createdAt: $now
				})
				MERGE (u)-[:HAS_NOTIFICATION]->(n)
				RETURN n AS notification
			`,
			{
				notificationId,
				userId: parsed.userId,
				type: parsed.type,
				title: parsed.title,
				body: parsed.body ?? null,
				now,
			},
			row => NotificationNodeSchema.parse(row.notification),
		);

		await invalidateCachePattern(cacheKey('notifications', parsed.userId, '*'));
		return rows[0];
	},

	async listUserNotifications(
		userId: string,
		pagination: { limit?: number; cursor?: string },
	): Promise<NotificationsResponse> {
		const parsedUserId = z.string().uuid().parse(userId);
		const parsedPagination = PaginationQuerySchema.parse(pagination);

		const key = cacheKey(
			'notifications',
			parsedUserId,
			parsedPagination.limit,
			parsedPagination.cursor ?? 'none',
		);

		const response = await cacheAside(
			key,
			async () => {
				const rows = await runRead(
					`
						MATCH (:Mosaic_User {id: $userId})-[:HAS_NOTIFICATION]->(n:Mosaic_Notification)
						WHERE $cursor IS NULL OR n.createdAt < toInteger($cursor)
						RETURN n AS notification
						ORDER BY n.createdAt DESC
						LIMIT toInteger($limit)
					`,
					{
						userId: parsedUserId,
						cursor: parsedPagination.cursor ? Number(parsedPagination.cursor) : null,
						limit: parsedPagination.limit,
					},
					row => NotificationNodeSchema.parse(row.notification),
				);

				const last = rows[rows.length - 1];

				return {
					items: rows,
					meta: {
						limit: parsedPagination.limit,
						cursor: last ? String(last.createdAt) : null,
						hasMore: rows.length === parsedPagination.limit,
					},
				} satisfies NotificationsResponse;
			},
			30,
		);

		return NotificationsResponseSchema.parse(response);
	},

	async markNotificationRead(userId: string, notificationId: string): Promise<void> {
		const parsed = markReadInput.parse({ userId, notificationId });

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})-[:HAS_NOTIFICATION]->(n:Mosaic_Notification {id: $notificationId})
				SET n.isRead = true
				RETURN n.id AS id
			`,
			{
				userId: parsed.userId,
				notificationId: parsed.notificationId,
			},
			row => row.id,
		);

		await invalidateCachePattern(cacheKey('notifications', parsed.userId, '*'));
	},
};

