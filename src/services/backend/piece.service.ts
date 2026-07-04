import { runRead } from './shared';

export interface FeaturedPiece {
  id: string;
  title: string;
  type: string;
  community: string;
  description: string;
}

export interface PieceDetails {
  id: string;
  title: string;
  contentUrl: string;
  contentType: string;
  createdAt: number;
  author: {
    id: string;
    name: string;
    username: string;
  };
  community: {
    id: string;
    name: string;
  };
}

export const pieceService = {
  async getFeaturedPieces(limit = 5): Promise<FeaturedPiece[]> {
    const query = `
      MATCH (p:Mosaic_Piece)
      OPTIONAL MATCH (c:Mosaic_Community)-[:PUBLISHED_IN]->(p)
      OPTIONAL MATCH (a:Mosaic_User)-[:AUTHORED]->(p)
      RETURN p.id AS id, p.title AS title, p.contentType AS type, coalesce(c.name, 'Unknown Community') AS community, coalesce(a.displayName, a.username) AS author
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
      OPTIONAL MATCH (author:Mosaic_User)-[:AUTHORED]->(p)
      OPTIONAL MATCH (community:Mosaic_Community)-[:PUBLISHED_IN]->(p)
      RETURN p, author, community
    `;

    const rows = await runRead(query, { id }, (row) => {
      const p = row.p as Record<string, unknown>;
      const author = row.author as Record<string, unknown> | null;
      const community = row.community as Record<string, unknown> | null;

      if (!p) return null;

      return {
        id: p.id as string,
        title: p.title as string,
        contentUrl: p.contentUrl as string,
        contentType: p.contentType as string,
        createdAt: p.createdAt as number,
        author: {
          id: (author?.id as string) || '',
          name: (author?.displayName as string) || (author?.username as string) || 'Unknown Author',
          username: (author?.username as string) || '',
        },
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
      MATCH (community:Mosaic_Community {id: $communityId})-[:PUBLISHED_IN]->(p:Mosaic_Piece)
      WHERE 1=1 ${typeFilter}
      OPTIONAL MATCH (author:Mosaic_User)-[:AUTHORED]->(p)
      RETURN p, author, community
      ORDER BY p.createdAt DESC
      SKIP toInteger($offset)
      LIMIT toInteger($limit)
    `;

    const rows = await runRead(query, { communityId, limit, offset, filter: filter?.slice(0, -1) }, (row) => {
      // NOTE: slicing 's' off filter if the UI passes 'Pieces' instead of 'Piece' 
      // or we just trust the filter if the frontend already handles singular vs plural.
      const p = row.p as Record<string, unknown>;
      const author = row.author as Record<string, unknown> | null;
      const communityNode = row.community as Record<string, unknown>;

      return {
        id: p.id as string,
        title: p.title as string,
        contentUrl: p.contentUrl as string,
        contentType: p.contentType as string,
        createdAt: p.createdAt as number,
        author: {
          id: (author?.id as string) || '',
          name: (author?.displayName as string) || (author?.username as string) || 'Unknown Author',
          username: (author?.username as string) || '',
        },
        community: {
          id: (communityNode?.id as string) || '',
          name: (communityNode?.name as string) || 'Unknown Community',
        },
      };
    });

    return rows;
  }
};
