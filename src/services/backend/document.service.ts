import { runWrite, runRead } from './shared';

export interface DocumentDetails {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  status: string;
}

export const documentService = {
  async createDocument(userId: string, title: string, content: string): Promise<string> {
    const id = `doc_${Date.now()}`;
    const query = `
      MATCH (u:Mosaic_User {id: $userId})
      CREATE (d:Mosaic_Document {
        id: $id,
        title: $title,
        content: $content,
        createdAt: timestamp(),
        updatedAt: timestamp(),
        status: 'Draft'
      })
      CREATE (u)-[:DRAFTED]->(d)
      RETURN d.id AS id
    `;

    const rows = await runWrite(query, { userId, id, title, content }, (row) => row.id as string);
    if (!rows.length) throw new Error('Failed to create document');
    return rows[0];
  },

  async updateDocument(id: string, userId: string, updates: Partial<DocumentDetails>): Promise<void> {
    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id, userId };

    if (updates.title) {
      setClauses.push('d.title = $title');
      params.title = updates.title;
    }
    if (updates.content !== undefined) {
      setClauses.push('d.content = $content');
      params.content = updates.content;
    }
    if (updates.status) {
      setClauses.push('d.status = $status');
      params.status = updates.status;
    }

    if (setClauses.length === 0) return;

    setClauses.push('d.updatedAt = timestamp()');

    const query = `
      MATCH (u:Mosaic_User {id: $userId})-[:DRAFTED]->(d:Mosaic_Document {id: $id})
      SET ${setClauses.join(', ')}
      RETURN d.id
    `;

    const rows = await runWrite(query, params, (row) => row);
    if (!rows.length) throw new Error('Document not found or unauthorized');
  },

  async getDocument(id: string, userId: string): Promise<DocumentDetails | null> {
    const query = `
      MATCH (u:Mosaic_User {id: $userId})-[:DRAFTED]->(d:Mosaic_Document {id: $id})
      RETURN d
    `;

    const rows = await runRead(query, { id, userId }, (row) => {
      const d = row.d as Record<string, unknown>;
      return {
        id: d.id as string,
        title: d.title as string,
        content: (d.content as string) || '',
        createdAt: d.createdAt as number,
        updatedAt: d.updatedAt as number,
        status: d.status as string
      };
    });

    return rows.length > 0 ? rows[0] : null;
  },

  async getUserDocuments(userId: string, limit = 50, offset = 0): Promise<DocumentDetails[]> {
    const query = `
      MATCH (u:Mosaic_User {id: $userId})-[:DRAFTED]->(d:Mosaic_Document)
      RETURN d
      ORDER BY d.updatedAt DESC
      SKIP toInteger($offset)
      LIMIT toInteger($limit)
    `;

    return runRead(query, { userId, limit, offset }, (row) => {
      const d = row.d as Record<string, unknown>;
      return {
        id: d.id as string,
        title: d.title as string,
        content: (d.content as string) || '',
        createdAt: d.createdAt as number,
        updatedAt: d.updatedAt as number,
        status: d.status as string
      };
    });
  },

  async publishDocumentToPiece(documentId: string, userId: string, communityId: string): Promise<string> {
    // This converts a Document into a Piece and links it to a community
    const query = `
      MATCH (u:Mosaic_User {id: $userId})-[:DRAFTED]->(d:Mosaic_Document {id: $documentId})
      MATCH (c:Mosaic_Community {id: $communityId})
      
      // Remove DRAFTED label and replace with Piece labels
      REMOVE d:Mosaic_Document
      SET d:Mosaic_Piece,
          d.status = 'Published',
          d.contentType = 'Publication',
          d.contentUrl = '' // Not used for native studio pieces
      
      // Create Piece relationships
      MERGE (u)-[:AUTHORED]->(d)
      MERGE (c)-[:PUBLISHED_IN]->(d)
      
      // Delete old draft relationship
      WITH u, d
      MATCH (u)-[r:DRAFTED]->(d)
      DELETE r
      
      RETURN d.id AS id
    `;

    const rows = await runWrite(query, { documentId, userId, communityId }, (row) => row.id as string);
    if (!rows.length) throw new Error('Failed to publish document');
    return rows[0];
  }
};
