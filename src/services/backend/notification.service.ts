import { z } from 'zod';
import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(
		'mailto:support@mosaic.app',
		process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		process.env.VAPID_PRIVATE_KEY
	);
}

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
				OPTIONAL MATCH (u)-[:HAS_NOTIFICATION]->(existing:Mosaic_Notification {isRead: false})
				WHERE $aggregationKey IS NOT NULL AND existing.aggregationKey = $aggregationKey
				WITH u, existing
				ORDER BY existing.createdAt DESC
				LIMIT 1
				WITH u, existing,
					 CASE WHEN existing IS NOT NULL THEN existing.id ELSE $notificationId END AS targetId
				
				MERGE (n:Mosaic_Notification {id: targetId})
				ON CREATE SET
					n.userId = $userId,
					n.type = $type,
					n.title = $title,
					n.body = $body,
					n.isRead = false,
					n.aggregationKey = $aggregationKey,
					n.actionUrl = $actionUrl,
					n.actors = [],
					n.createdAt = $now
				ON MATCH SET
					n.title = $title,
					n.body = $body,
					n.updatedAt = $now
				
				MERGE (u)-[:HAS_NOTIFICATION]->(n)
				RETURN n AS notification, u.pushSubscription AS pushSubscription, u.settings AS settings
			`,
			{
				notificationId,
				userId: parsed.userId,
				type: parsed.type,
				title: parsed.title,
				body: parsed.body ?? null,
				aggregationKey: parsed.aggregationKey ?? null,
				actionUrl: parsed.actionUrl ?? null,
				now,
			},
			row => ({
				notification: NotificationNodeSchema.parse(row.notification),
				pushSubscription: row.pushSubscription ? JSON.parse(row.pushSubscription as string) : null,
				settings: row.settings ? JSON.parse(row.settings as string) : null,
			}),
		);

		const { notification, pushSubscription, settings } = rows[0];

		// Check if we should send a push notification
		if (pushSubscription && process.env.VAPID_PRIVATE_KEY) {
			try {
				let shouldPush = false;
				// By default push is enabled unless disabled in settings
				if (settings && settings.notifications) {
					// We need to map notification type to the setting key
					const typeMap: Record<string, keyof typeof settings.notifications> = {
						'MENTION': 'pushMentions',
						'REPLY': 'pushReplies',
						'UPVOTE': 'pushUpvotes',
						'SIGNATURE_REQUEST': 'pushSignatureRequests',
						'PIECE_UPDATE': 'pushPieceUpdates',
						'VILLAGE_ANNOUNCEMENT': 'pushCommunityAlerts',
						'SYSTEM_UPDATE': 'pushSystemUpdates',
					};
					const key = typeMap[parsed.type];
					shouldPush = key ? settings.notifications[key] !== false : true;
				} else {
					shouldPush = true; // Fallback
				}

				if (shouldPush) {
					await webpush.sendNotification(
						pushSubscription,
						JSON.stringify({
							title: parsed.title,
							body: parsed.body,
							actionUrl: parsed.actionUrl
						})
					).catch((err: unknown) => {
						const pushErr = err as { statusCode?: number };
						if (pushErr.statusCode === 410) {
							// Subscription expired or unsubscribed, remove from DB
							console.log('Push subscription expired, removing...');
							runWrite('MATCH (u:Mosaic_User {id: $userId}) REMOVE u.pushSubscription', { userId: parsed.userId }, () => null);
						}
					});
				}
			} catch (e) {
				console.error('Failed to send push notification', e);
			}
		}

		await invalidateCachePattern(cacheKey('notifications', parsed.userId, '*'));
		return notification;
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

	async savePushSubscription(userId: string, subscription: unknown): Promise<void> {
		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				SET u.pushSubscription = $subscription
				RETURN u.id AS id
			`,
			{
				userId,
				subscription: JSON.stringify(subscription),
			},
			row => row.id,
		);
	},

	async notifyUpvote(userId: string, actorName: string, postTitle: string, postId: string) {
		const aggregationKey = `upvote:post:${postId}`;
		const title = `New Upvote`;
		const body = `${actorName} upvoted your post "${postTitle}"`;
		
		// In a real scenario with actors array, we'd pass actorName to createNotification 
		// and the Cypher query would append it to `actors` if it exists. 
		// For now we just overwrite the body to show the latest state.
		
		return this.createNotification({
			userId,
			type: 'UPVOTE',
			title,
			body,
			aggregationKey,
			actionUrl: `/post/${postId}`
		});
	},

	async notifySignatureRequest(userId: string, actorName: string, pieceTitle: string, pieceId: string) {
		return this.createNotification({
			userId,
			type: 'SIGNATURE_REQUEST',
			title: 'Signature Request',
			body: `${actorName} requested your signature as a co-author on "${pieceTitle}"`,
			actionUrl: `/studio/${pieceId}`
		});
	},

	async notifyCommunityMemberJoined(adminId: string, memberName: string, communityName: string, communityId: string) {
		return this.createNotification({
			userId: adminId,
			type: 'COMMUNITY_MEMBER_JOINED',
			title: 'New Community Member',
			body: `${memberName} just joined ${communityName}!`,
			actionUrl: `/v/${communityId}`
		});
	}
};

