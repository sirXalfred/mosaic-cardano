import { runRead } from './shared';

export interface FeaturedPiece {
  id: string;
  title: string;
  type: string;
  community: string;
  description: string;
}

import { PieceDetails } from '@/types/mosaic';

export const pieceService = {
  async getFeaturedPieces(limit = 5): Promise<FeaturedPiece[]> {
    const query = `
      MATCH (p:Mosaic_Piece)
      OPTIONAL MATCH (p)-[:PUBLISHED_IN]->(c:Mosaic_Community)
      OPTIONAL MATCH (p)-[:HAS_CONTRIBUTION]->(contrib:Mosaic_Contribution)-[:MADE_BY]->(a:Mosaic_User)
      // Fallback for older pieces
      OPTIONAL MATCH (legacyAuthor:Mosaic_User)-[:AUTHORED]->(p)
      RETURN p.id AS id, p.title AS title, p.contentType AS type, coalesce(c.name, 'Unknown Community') AS community, coalesce(a.displayName, a.username, legacyAuthor.displayName, legacyAuthor.username) AS author
      ORDER BY p.createdAt ASC
      LIMIT toInteger($limit)
    `;

    const rows = await runRead(query, { limit }, (row) => ({
      id: row.id as string,
      title: row.title as string,
      type: row.type as string,
      community: row.community as string,
      description: `A piece from the ${row.community} community ${row.author ? 'by ' + row.author : ''}.`,
    }));

    return rows;
  },

  async getPieceById(id: string): Promise<PieceDetails | null> {
    const query = `
      MATCH (p:Mosaic_Piece {id: $id})
      OPTIONAL MATCH (p)-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution)-[:MADE_BY]->(u:Mosaic_User)
      OPTIONAL MATCH (legacyAuthor:Mosaic_User)-[:AUTHORED]->(p)
      OPTIONAL MATCH (p)-[:PUBLISHED_IN]->(community:Mosaic_Community)
      RETURN p, community, legacyAuthor, collect({
        userId: u.id,
        name: u.displayName,
        username: u.username,
        role: c.role,
        weight: c.weight
      }) AS contributors
    `;

    const rows = await runRead(query, { id }, (row) => {
      const p = row.p as Record<string, unknown>;
      const legacyAuthor = row.legacyAuthor as Record<string, unknown> | null;
      const community = row.community as Record<string, unknown> | null;
      const contribs = row.contributors as { userId: string; name: string; username: string; role: string; weight: number; }[];

      let mappedContributors = contribs.filter(c => c.userId !== null);
      if (mappedContributors.length === 0 && legacyAuthor) {
        mappedContributors = [{
          userId: legacyAuthor.id as string,
          name: (legacyAuthor.displayName as string) || (legacyAuthor.username as string) || 'Unknown Author',
          username: legacyAuthor.username as string,
          role: 'Creator',
          weight: 100
        }];
      }

      return {
        id: p.id as string,
        title: p.title as string,
        contentUrl: p.contentUrl as string,
        contentType: p.contentType as string,
        createdAt: p.createdAt as number,
        contributors: mappedContributors,
        community: {
          id: (community?.id as string) || '',
          name: (community?.name as string) || 'Unknown Community',
        },
      };
    });

    return rows.length > 0 && rows[0] !== null ? rows[0] : null;
  },

  async listVillagePieces(communityId: string, limit = 50, offset = 0, filter?: string): Promise<PieceDetails[]> {
    let typeFilter = '';
    // Assuming filter matches contentType, adjust if necessary
    if (filter && filter !== 'All') {
      typeFilter = `AND p.contentType = $filter`;
    }

    const query = `
      MATCH (p:Mosaic_Piece)-[:PUBLISHED_IN]->(community:Mosaic_Community {id: $communityId})
      WHERE 1=1 ${typeFilter}
      OPTIONAL MATCH (p)-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution)-[:MADE_BY]->(u:Mosaic_User)
      OPTIONAL MATCH (legacyAuthor:Mosaic_User)-[:AUTHORED]->(p)
      RETURN p, community, legacyAuthor, collect({
        userId: u.id,
        name: u.displayName,
        username: u.username,
        role: c.role,
        weight: c.weight
      }) AS contributors
      ORDER BY p.createdAt DESC
      SKIP toInteger($offset)
      LIMIT toInteger($limit)
    `;

    const rows = await runRead(query, { communityId, limit, offset, filter }, (row) => {
      // NOTE: The frontend already handles singular vs plural.
      const p = row.p as Record<string, unknown>;
      const legacyAuthor = row.legacyAuthor as Record<string, unknown> | null;
      const communityNode = row.community as Record<string, unknown>;
      const contribs = row.contributors as { userId: string; name: string; username: string; role: string; weight: number; }[];

      let mappedContributors = contribs.filter(c => c.userId !== null);
      if (mappedContributors.length === 0 && legacyAuthor) {
        mappedContributors = [{
          userId: legacyAuthor.id as string,
          name: (legacyAuthor.displayName as string) || (legacyAuthor.username as string) || 'Unknown Author',
          username: legacyAuthor.username as string,
          role: 'Creator',
          weight: 100
        }];
      }

      return {
        id: p.id as string,
        title: p.title as string,
        contentUrl: p.contentUrl as string,
        contentType: p.contentType as string,
        createdAt: p.createdAt as number,
        contributors: mappedContributors,
        community: {
          id: (communityNode?.id as string) || '',
          name: (communityNode?.name as string) || 'Unknown Community',
        },
      };
    });

    return rows;
  }
};
