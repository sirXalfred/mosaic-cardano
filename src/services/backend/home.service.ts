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
  type: 'governance' | 'discussion' | 'treasury';
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
    const parsed = listLimitInput.parse({ limit });

    return runRead(
      `
        MATCH (:Mosaic_User {id: $userId})-[membership:CONTRIBUTED_TO]->(project:Mosaic_Project {status: 'ACTIVE'})
        OPTIONAL MATCH (project)<-[:CONTRIBUTED_TO]-(collaborator:Mosaic_User)
        OPTIONAL MATCH (project)<-[:HOSTS]-(community:Mosaic_Community)
        OPTIONAL MATCH (project)-[:CONTAINS]->(artifact:Mosaic_Piece)
        WITH project, community,
          collect(DISTINCT collaborator.displayName) AS collaboratorNames,
          count(DISTINCT artifact) AS artifactCount,
          max(artifact.createdAt) AS lastArtifactAt
        RETURN project AS project, community AS community, collaboratorNames AS collaboratorNames, artifactCount AS artifactCount, coalesce(lastArtifactAt, project.createdAt) AS activityAt
        ORDER BY activityAt DESC
        LIMIT toInteger($limit)
      `,
      { userId, limit: parsed.limit },
      row => {
        const project = row.project as { id: string; title: string; description: string; createdAt: number };
        const community = row.community as { id?: string; name?: string } | null;
        const collaboratorNames = Array.isArray(row.collaboratorNames)
          ? row.collaboratorNames.filter((name): name is string => typeof name === 'string' && name.length > 0)
          : [];
        const artifactCount = Number(row.artifactCount ?? 0);
        const activityAt = typeof row.activityAt === 'number' ? row.activityAt : project.createdAt;

        return {
          id: project.id,
          title: project.title,
          community: community?.name ?? 'Community',
          description: project.description,
          progress: Math.min(95, 20 + artifactCount * 12 + collaboratorNames.length * 6),
          lastActivityAt: activityAt,
          collaborators: collaboratorNames.slice(0, 3),
          link: ROUTES.WORKSPACE,
        } satisfies HomeProjectSummary;
      },
    );
  },

  async listCommunityUpdates(userId: string, limit = 6): Promise<HomeCommunityUpdate[]> {
    const parsed = listLimitInput.parse({ limit });

    return runRead(
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
          id: `${community.id}:${project.id}`,
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
    );
  },

  async listSavedItems(_userId: string): Promise<SavedItemSummary[]> {
    // TODO: Implement saved items query
    if (_userId)
      return [];
    return []
  },

  async listPendingSignatures(userId: string, limit = 6): Promise<{ id: string, title: string, community: string, link: string }[]> {
    const parsed = listLimitInput.parse({ limit });
    
    return runRead(
      `
        MATCH (p:Mosaic_Piece {publishStage: 'waiting'})-[:PUBLISHED_IN]->(community:Mosaic_Community)
        MATCH (p)-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution {status: 'Pending'})-[:MADE_BY]->(:Mosaic_User {id: $userId})
        RETURN p AS piece, community AS community
        ORDER BY p.updatedAt DESC
        LIMIT toInteger($limit)
      `,
      { userId, limit: parsed.limit },
      row => {
        const piece = row.piece as { id: string; title: string };
        const community = row.community as { name: string };
        
        return {
          id: piece.id,
          title: piece.title,
          community: community.name,
          link: ROUTES.WORKSPACE_EDITOR(piece.id),
        };
      }
    );
  }
};