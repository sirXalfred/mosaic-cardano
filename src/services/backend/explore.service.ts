import { runRead } from './shared';
import { ROUTES } from '@/lib/routes';

export type ExploreCard = {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  members?: number;
  link: string;
  communityId: string;
  communityName: string;
  type: 'community';
  topic?: string | null;
  location?: string | null;
  isMember: boolean;
  previewAvatars?: string[];
};

export type ExploreFilters = {
  search?: string | null;
  topic?: string | null;
  location?: string | null;
  visibility?: string | null;
  activityLevel?: string | null;
  tab?: string | null;
};

export type ExplorePage = {
  items: ExploreCard[];
  meta: {
    hasMore: boolean;
    nextOffset: number;
    pageSize: number;
  };
};

export const exploreService = {
  async listExplore(
    filters: ExploreFilters = {},
    userId: string | null = null,
    pageSize = 20,
    offset = 0,
  ): Promise<ExplorePage> {
    const parsedPageSize = Math.max(1, Math.min(50, Number(pageSize) || 20));
    const parsedOffset = Math.max(0, Number(offset) || 0);

    // Build dynamic WHERE clauses based on provided filters
    const whereClauses: string[] = [];
    const params: Record<string, string | number | null> = { pageSize: parsedPageSize + 1, offset: parsedOffset, userId };

    if (filters.search) {
      whereClauses.push('(toLower(c.name) CONTAINS toLower($search) OR toLower(c.description) CONTAINS toLower($search))');
      params.search = String(filters.search);
    }
    if (filters.location) {
      whereClauses.push('toLower(c.location) = toLower($location)');
      params.location = String(filters.location);
    }
    if (filters.topic) {
      whereClauses.push('toLower(c.topic) = toLower($topic)');
      params.topic = String(filters.topic);
    }
    if (filters.visibility) {
      whereClauses.push('toLower(c.visibility) = toLower($visibility)');
      params.visibility = String(filters.visibility);
    }
    if (filters.activityLevel) {
      whereClauses.push('toLower(c.activityLevel) = toLower($activityLevel)');
      params.activityLevel = String(filters.activityLevel);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      MATCH (c:Mosaic_Community)
      OPTIONAL MATCH (viewer:Mosaic_User {id: $userId})
      OPTIONAL MATCH (viewer)-[membership:MEMBER_OF]->(c)
      OPTIONAL MATCH (c)<-[:MEMBER_OF]-(member:Mosaic_User)
      ${where}
      WITH c, count(DISTINCT member) AS memberCount, count(membership) > 0 AS isMember, collect(DISTINCT member.avatarUrl)[0..3] AS previewAvatars
      RETURN c AS community, memberCount, isMember, previewAvatars
      ORDER BY c.createdAt DESC
      SKIP toInteger($offset)
      LIMIT toInteger($pageSize)
    `;

    const rows = await runRead(query, params, row => {
      const community = row.community as Record<string, string | number | null>;
      return {
        id: community.id,
        name: community.name ?? community.id,
        description: community.description ?? '',
        image: community.avatarUrl ?? null,
        members: typeof row.memberCount === 'number' ? row.memberCount : undefined,
        link: ROUTES.VILLAGE.HOME(community.id as string),
        communityId: community.id,
        communityName: community.name ?? community.id,
        type: 'community' as const,
        topic: community.topic ?? null,
        location: community.location ?? null,
        isMember: Boolean(row.isMember),
        previewAvatars: Array.isArray(row.previewAvatars) ? row.previewAvatars.filter(Boolean) : [],
      } as ExploreCard;
    });

    const hasMore = rows.length > parsedPageSize;
    const items = hasMore ? rows.slice(0, parsedPageSize) : rows;

    return {
      items,
      meta: {
        hasMore,
        nextOffset: parsedOffset + items.length,
        pageSize: parsedPageSize,
      },
    };
  },

  async getExploreItem(id: string): Promise<ExploreCard | null> {
    const rows = await runRead(
      `MATCH (c:Mosaic_Community {id: $id}) RETURN c AS community LIMIT 1`,
      { id },
      row => row.community
    );
    if (!rows || rows.length === 0) return null;
    const community = rows[0] as Record<string, string | number | null>;
    return {
      id: community.id,
      name: community.name ?? community.id,
      description: community.description ?? '',
      image: community.avatarUrl ?? null,
      members: typeof community.memberCount === 'number' ? community.memberCount : undefined,
      link: ROUTES.VILLAGE.HOME(community.id as string),
      communityId: community.id,
      communityName: community.name ?? community.id,
      type: 'community',
      topic: community.topic ?? null,
      location: community.location ?? null,
      isMember: false,
      previewAvatars: [],
    } as ExploreCard;
  }
};
