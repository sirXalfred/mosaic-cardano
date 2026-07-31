import { z } from 'zod';

import { ROUTES } from '@/lib/routes';
import { notificationService } from './notification.service';
import { runRead } from './shared';

const listLimitInput = z.object({
  limit: z.number().int().positive().max(50).default(6),
});

const actionableNotificationTypes = ['INVITE', 'MENTION', 'PROJECT_UPDATE'] as const;
type ActionableNotificationType = typeof actionableNotificationTypes[number];

export type HomeActionItem = {
  id: string;
  type: 'INVITE' | 'MENTION' | 'PROJECT_UPDATE';
  title: string;
  description: string;
  timestamp: number;
  source: string;
  link: string;
};

export type HomeProjectSummary = {
  id: string;
  title: string;
  community: string;
  description: string;
  progress: number;
  lastActivityAt: number;
  collaborators: string[];
  link: string;
};

export type HomeCommunityUpdate = {
  id: string;
  type: 'governance' | 'discussion' | 'treasury' | 'announcement';
  community: string;
  title: string;
  description: string;
  timestamp: number;
  status: string;
  link: string;
};

export type SavedItemSummary = {
  id: string;
  title: string;
  type: string;
  author: string;
  link: string;
};

export const homeService = {
  async listActionItems(userId: string, limit = 6): Promise<HomeActionItem[]> {
    const parsed = listLimitInput.parse({ limit });
    const notifications = await notificationService.listUserNotifications(userId, { limit: parsed.limit });
    const actionableNotifications = notifications.items.filter(
      (notification): notification is (typeof notifications.items)[number] & { type: ActionableNotificationType } =>
        actionableNotificationTypes.includes(notification.type as ActionableNotificationType),
    );

    return actionableNotifications
      .filter(notification => !notification.isRead)
      .slice(0, parsed.limit)
      .map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        description: notification.body ?? notification.title,
        timestamp: notification.createdAt,
        source: notification.type,
        link: ROUTES.NOTIFICATIONS,
      }));
  },

  async listActiveProjects(userId: string, limit = 6): Promise<HomeProjectSummary[]> {
    try {
      const parsed = listLimitInput.parse({ limit });

      const [projects, draftPieces] = await Promise.all([
        // Query 1: Active & Draft Projects
        runRead(
          `
            MATCH (u:Mosaic_User {id: $userId})
            MATCH (u)-[:CONTRIBUTED_TO|CREATED_BY]->(project:Mosaic_Project)
            WHERE project.status = 'ACTIVE' OR project.status = 'DRAFT'
            OPTIONAL MATCH (project)<-[:CONTRIBUTED_TO|CREATED_BY]-(collaborator:Mosaic_User)
            OPTIONAL MATCH (project)<-[:HOSTS]-(community:Mosaic_Community)
            OPTIONAL MATCH (project)-[:CONTAINS]->(artifact:Mosaic_Piece)
            WITH project, community,
              collect(DISTINCT coalesce(collaborator.displayName, collaborator.username)) AS collaboratorNames,
              count(DISTINCT artifact) AS artifactCount,
              max(artifact.createdAt) AS lastArtifactAt
            RETURN project AS project, community AS community, collaboratorNames AS collaboratorNames, artifactCount AS artifactCount, coalesce(lastArtifactAt, project.updatedAt, project.createdAt) AS activityAt
            ORDER BY activityAt DESC
            LIMIT toInteger($limit)
          `,
          { userId, limit: parsed.limit },
          row => {
            const project = row.project as { id: string; title: string; description?: string; createdAt: number };
            const community = row.community as { id?: string; name?: string } | null;
            const collaboratorNames = Array.isArray(row.collaboratorNames)
              ? row.collaboratorNames.filter((name): name is string => typeof name === 'string' && name.length > 0)
              : [];
            const artifactCount = Number(row.artifactCount ?? 0);
            const activityAt = typeof row.activityAt === 'number' ? row.activityAt : project.createdAt;

            return {
              id: project.id,
              title: project.title || 'Untitled Project',
              community: community?.name ?? 'Workspace',
              description: project.description || 'Active project in workspace',
              progress: Math.min(95, 20 + artifactCount * 12 + collaboratorNames.length * 6),
              lastActivityAt: activityAt,
              collaborators: collaboratorNames.slice(0, 3),
              link: ROUTES.WORKSPACE,
            } satisfies HomeProjectSummary;
          },
        ),

        // Query 2: Unpublished Pieces (Drafts / Waiting for Signatures)
        runRead(
          `
            MATCH (u:Mosaic_User {id: $userId})
            MATCH (piece:Mosaic_Piece)
            WHERE ( (piece)-[:CREATED_BY]->(u) OR (piece)-[:HAS_CONTRIBUTION]->(:Mosaic_Contribution)-[:MADE_BY]->(u) )
              AND (piece.status IS NULL OR piece.status <> 'Published')
            OPTIONAL MATCH (piece)-[:CREATED_BY]->(creator:Mosaic_User)
            OPTIONAL MATCH (piece)-[:HAS_CONTRIBUTION]->(:Mosaic_Contribution)-[:MADE_BY]->(collaborator:Mosaic_User)
            OPTIONAL MATCH (piece)-[:PUBLISHED_IN]->(community:Mosaic_Community)
            WITH piece, community, creator,
              collect(DISTINCT coalesce(collaborator.displayName, collaborator.username)) AS collaboratorNames
            RETURN piece AS piece, community AS community, creator AS creator, collaboratorNames AS collaboratorNames
            ORDER BY coalesce(piece.updatedAt, piece.createdAt) DESC
            LIMIT toInteger($limit)
          `,
          { userId, limit: parsed.limit },
          row => {
            const piece = row.piece as { id: string; title: string; contentType?: string; status?: string; publishStage?: string; createdAt: number; updatedAt?: number };
            const community = row.community as { name?: string } | null;
            const creator = row.creator as { displayName?: string; username?: string } | null;
            const collaboratorNames = Array.isArray(row.collaboratorNames)
              ? row.collaboratorNames.filter((name): name is string => typeof name === 'string' && name.length > 0)
              : [];

            if (creator) {
              const creatorName = creator.displayName || creator.username;
              if (creatorName && !collaboratorNames.includes(creatorName)) {
                collaboratorNames.unshift(creatorName);
              }
            }

            const activityAt = typeof piece.updatedAt === 'number' ? piece.updatedAt : piece.createdAt;
            const isWaiting = piece.publishStage === 'waiting';

            return {
              id: piece.id,
              title: piece.title || 'Untitled Piece',
              community: community?.name ?? 'Draft Piece',
              description: isWaiting ? 'Pending co-author signatures' : `Draft ${piece.contentType || 'document'} in progress`,
              progress: isWaiting ? 80 : 35,
              lastActivityAt: activityAt,
              collaborators: collaboratorNames.slice(0, 3),
              link: ROUTES.WORKSPACE_EDITOR(piece.id),
            } satisfies HomeProjectSummary;
          },
        ),
      ]);

      const combinedMap = new Map<string, HomeProjectSummary>();
      for (const item of [...projects, ...draftPieces]) {
        if (!combinedMap.has(item.id)) {
          combinedMap.set(item.id, item);
        }
      }

      return Array.from(combinedMap.values())
        .sort((a, b) => b.lastActivityAt - a.lastActivityAt)
        .slice(0, parsed.limit);
    } catch (err) {
      console.error('Failed to list active projects and drafts:', err);
      return [];
    }
  },

  async listCommunityUpdates(userId: string, limit = 6): Promise<HomeCommunityUpdate[]> {
    try {
      const parsed = listLimitInput.parse({ limit });

      const [projectUpdates, announcements] = await Promise.all([
        // Query 1: Project Updates in Member Villages
        runRead(
          `
            MATCH (:Mosaic_User {id: $userId})-[:MEMBER_OF]->(community:Mosaic_Community)<-[:HOSTS]-(project:Mosaic_Project)
            OPTIONAL MATCH (project)-[:CONTAINS]->(artifact:Mosaic_Piece)
            WITH community, project,
              count(DISTINCT artifact) AS artifactCount,
              max(artifact.createdAt) AS lastActivityAt
            RETURN community AS community, project AS project, artifactCount AS artifactCount, coalesce(lastActivityAt, project.createdAt) AS activityAt
            ORDER BY activityAt DESC, project.createdAt DESC
            LIMIT toInteger($limit)
          `,
          { userId, limit: parsed.limit },
          row => {
            const community = row.community as { id: string; name: string };
            const project = row.project as { id: string; title: string };
            const artifactCount = Number(row.artifactCount ?? 0);
            const activityAt = typeof row.activityAt === 'number' ? row.activityAt : undefined;

            return {
              id: `proj_${community.id}_${project.id}`,
              type: artifactCount > 0 ? 'discussion' : 'governance',
              community: community.name,
              title: `${project.title} activity`,
              description: artifactCount > 0
                ? `${artifactCount} artifact${artifactCount === 1 ? '' : 's'} updated in ${community.name}.`
                : `New project activity in ${community.name}.`,
              timestamp: activityAt ?? Date.now(),
              status: artifactCount > 0 ? 'Active' : 'Queued',
              link: ROUTES.VILLAGE.FEED(community.id),
            } satisfies HomeCommunityUpdate;
          },
        ),

        // Query 2: Pinned Village Announcements in Member Villages
        runRead(
          `
            MATCH (:Mosaic_User {id: $userId})-[:MEMBER_OF]->(community:Mosaic_Community)<-[:POSTED_IN]-(post:Mosaic_Post)
            WHERE post.isPinned = true
            MATCH (post)<-[:AUTHORED]-(author:Mosaic_User)
            RETURN community AS community, post AS post, author AS author
            ORDER BY post.createdAt DESC
            LIMIT toInteger($limit)
          `,
          { userId, limit: parsed.limit },
          row => {
            const community = row.community as { id: string; name: string };
            const post = row.post as { id: string; content: string; createdAt: number };
            const author = row.author as { displayName?: string; username?: string };
            const authorName = author.displayName || author.username || 'Admin';

            return {
              id: `ann_${community.id}_${post.id}`,
              type: 'announcement',
              community: community.name,
              title: `Announcement by ${authorName}`,
              description: post.content.length > 120 ? `${post.content.substring(0, 120)}...` : post.content,
              timestamp: post.createdAt,
              status: 'Pinned',
              link: `${ROUTES.VILLAGE.FEED(community.id)}?post=${post.id}`,
            } satisfies HomeCommunityUpdate;
          },
        ),
      ]);

      const combined = [...announcements, ...projectUpdates];
      combined.sort((a, b) => b.timestamp - a.timestamp);
      return combined.slice(0, parsed.limit);
    } catch (err) {
      console.error('Failed to list community updates:', err);
      return [];
    }
  },

  async listSavedItems(_userId: string): Promise<SavedItemSummary[]> {
    // TODO: Implement saved items query
    if (_userId)
      return [];
    return []
  },

  async listPendingSignatures(userId: string, limit = 6): Promise<{ id: string, title: string, community: string, link: string }[]> {
    try {
      const parsed = listLimitInput.parse({ limit });
      
      return await runRead(
        `
          MATCH (p:Mosaic_Piece)-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution {status: 'Pending'})-[:MADE_BY]->(:Mosaic_User {id: $userId})
          WHERE p.publishStage = 'waiting' OR p.status = 'Proposed'
          OPTIONAL MATCH (p)-[:PUBLISHED_IN]->(community:Mosaic_Community)
          RETURN p AS piece, community AS community
          ORDER BY coalesce(p.updatedAt, p.createdAt) DESC
          LIMIT toInteger($limit)
        `,
        { userId, limit: parsed.limit },
        row => {
          const piece = row.piece as { id: string; title: string };
          const community = row.community as { name: string } | null;
          
          return {
            id: piece.id,
            title: piece.title || 'Untitled Piece',
            community: community?.name || 'Workspace',
            link: ROUTES.WORKSPACE_EDITOR(piece.id),
          };
        }
      );
    } catch (err) {
      console.error('Failed to list pending signatures:', err);
      return [];
    }
  }
};