import { runWrite, runRead } from './shared';
import { DocumentDetails, ContributionDetails } from '@/types/mosaic';
import { uploadTextToCloudinary } from '@/lib/cloudinary';

export const documentService = {
  async createDocument(userId: string, title: string, content: string): Promise<string> {
    const id = `doc_${Date.now()}`;
    // Creates a Mosaic_Piece in Draft status and sets CREATED_BY
    const query = `
      MATCH (u:Mosaic_User {id: $userId})
      CREATE (p:Mosaic_Piece {
        id: $id,
        title: $title,
        contentUrl: $contentUrl,
        createdAt: timestamp(),
        updatedAt: timestamp(),
        status: 'Draft',
        publishStage: 'draft',
        contentType: 'Publication'
      })
      CREATE (p)-[:CREATED_BY]->(u)
      
      // The creator is automatically added as a pending contributor with 100% weight by default
      CREATE (c:Mosaic_Contribution {
        id: 'contrib_' + timestamp() + '_' + u.id,
        role: 'Creator',
        weight: 100,
        status: 'Pending'
      })
      CREATE (p)-[:HAS_CONTRIBUTION]->(c)
      CREATE (c)-[:MADE_BY]->(u)

      RETURN p.id AS id
    `;

    const contentUrl = content ? await uploadTextToCloudinary(content, id) : '';
    const rows = await runWrite(query, { userId, id, title, contentUrl }, (row) => row.id as string);
    if (!rows.length) throw new Error('Failed to create document');
    return rows[0];
  },

  async updateDocument(documentId: string, userId: string, updates: Partial<DocumentDetails>): Promise<void> {
    const doc = await this.getDocument(documentId, userId);
    if (!doc) throw new Error('Document not found or unauthorized');

    // Block content edits if frozen
    const isFrozen = ['propose', 'waiting', 'mint', 'success'].includes(doc.publishStage || '');
    const isTryingToEditContent = updates.title !== undefined || updates.contentRaw !== undefined;
    
    if (isFrozen && isTryingToEditContent) {
      throw new Error('Document content is frozen and cannot be edited during publishing');
    }

    const setClauses: string[] = [];
    const params: Record<string, unknown> = { id: documentId, userId };

    if (updates.title) {
      setClauses.push('p.title = $title');
      params.title = updates.title;
    }
    if (updates.contentRaw) {
      const contentUrl = await uploadTextToCloudinary(updates.contentRaw, documentId);
      setClauses.push('p.contentRaw = $contentRaw, p.contentUrl = $contentUrl');
      params.contentRaw = updates.contentRaw;
      params.contentUrl = contentUrl;
    } else if (updates.contentUrl) {
      setClauses.push('p.contentUrl = $contentUrl');
      params.contentUrl = updates.contentUrl;
    }
    if (updates.status) {
      setClauses.push('p.status = $status');
      params.status = updates.status;
    }
    if (updates.publishStage) {
      setClauses.push('p.publishStage = $publishStage');
      params.publishStage = updates.publishStage;
    }
    if (updates.ipfsHash) {
      setClauses.push('p.ipfsHash = $ipfsHash');
      params.ipfsHash = updates.ipfsHash;
    }
    if (updates.ipfsManifest) {
      setClauses.push('p.ipfsManifest = $ipfsManifest');
      params.ipfsManifest = updates.ipfsManifest;
    }
    if (updates.isMainnet !== undefined) {
      setClauses.push('p.isMainnet = toInteger($isMainnet)');
      params.isMainnet = updates.isMainnet;
    }
    if (updates.communityId) {
      setClauses.push('p.communityId = $communityId');
      params.communityId = updates.communityId;
    }

    if (setClauses.length === 0) return;

    setClauses.push('p.updatedAt = timestamp()');

    // The Creator OR any invited Contributor can update the document details
    const query = `
      MATCH (p:Mosaic_Piece {id: $id})
      WHERE (p)-[:CREATED_BY]->(:Mosaic_User {id: $userId}) 
         OR (p)-[:HAS_CONTRIBUTION]->(:Mosaic_Contribution)-[:MADE_BY]->(:Mosaic_User {id: $userId})
      SET ${setClauses.join(', ')}
      RETURN p.id
    `;

    const rows = await runWrite(query, params, (row) => row);
    if (!rows.length) throw new Error('Document not found or unauthorized');
  },

  async getDocument(id: string, userId: string): Promise<DocumentDetails | null> {
    // Fetch piece and contributions if the user is either the creator or a contributor
    const query = `
      MATCH (p:Mosaic_Piece {id: $id})
      MATCH (p)-[:CREATED_BY]->(creator:Mosaic_User)
      OPTIONAL MATCH (p)-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution)-[:MADE_BY]->(cu:Mosaic_User)
      
      // Ensure the requesting user is either creator or a contributor
      WITH p, creator, c, cu
      MATCH (reqUser:Mosaic_User {id: $userId})
      WHERE creator.id = $userId OR (p)-[:HAS_CONTRIBUTION]->(:Mosaic_Contribution)-[:MADE_BY]->(reqUser)
      
      RETURN p, creator, collect({
        id: c.id,
        userId: cu.id,
        name: cu.displayName,
        username: cu.username,
        role: c.role,
        weight: c.weight,
        status: c.status,
        signatureHash: c.signatureHash,
        walletAddress: c.walletAddress
      }) AS contributions
    `;

    const rows = await runRead(query, { id, userId }, (row) => {
      const p = row.p as Record<string, unknown>;
      if (!p) return null;

      const creator = row.creator as Record<string, unknown>;
      const contributions = row.contributions as Record<string, unknown>[];

      // Filter out null objects from collect
      const validContribs = contributions.filter(c => c.id !== null);

      return {
        id: p.id as string,
        title: p.title as string,
        contentUrl: (p.contentUrl as string) || '',
        createdAt: p.createdAt as number,
        updatedAt: p.updatedAt as number,
        status: p.status as string,
        communityId: p.communityId as string,
        publishStage: p.publishStage as import('@/types/mosaic').PublishStep,
        ipfsHash: p.ipfsHash as string,
        ipfsManifest: p.ipfsManifest as string,
        isMainnet: p.isMainnet !== undefined ? (p.isMainnet as number) : undefined,
        creator: {
          id: creator.id as string,
          username: creator.username as string
        },
        contributions: validContribs as unknown as ContributionDetails[]
      };
    });

    return rows.length > 0 && rows[0] !== null ? rows[0] : null;
  },

  async getUserDocuments(userId: string, limit = 50, offset = 0): Promise<DocumentDetails[]> {
    // Documents where the user is either creator or a contributor
    const query = `
      MATCH (u:Mosaic_User {id: $userId})
      MATCH (p:Mosaic_Piece)
      WHERE (p)-[:CREATED_BY]->(u) OR (p)-[:HAS_CONTRIBUTION]->(:Mosaic_Contribution)-[:MADE_BY]->(u)
      RETURN p
      ORDER BY p.updatedAt DESC
      SKIP toInteger($offset)
      LIMIT toInteger($limit)
    `;

    return runRead(query, { userId, limit, offset }, (row) => {
      const p = row.p as Record<string, unknown>;
      return {
        id: p.id as string,
        title: p.title as string,
        contentUrl: (p.contentUrl as string) || '',
        createdAt: p.createdAt as number,
        updatedAt: p.updatedAt as number,
        status: p.status as string,
        communityId: p.communityId as string,
        publishStage: p.publishStage as import('@/types/mosaic').PublishStep
      };
    });
  },

  async inviteContributor(documentId: string, creatorId: string, usernameToInvite: string): Promise<void> {
    const sanitizedUsername = usernameToInvite.startsWith('@') ? usernameToInvite.slice(1) : usernameToInvite;
    const query = `
      MATCH (p:Mosaic_Piece {id: $documentId})-[:CREATED_BY]->(creator:Mosaic_User {id: $creatorId})
      MATCH (targetUser:Mosaic_User {username: $usernameToInvite})
      
      // Ensure targetUser isn't already a contributor
      WHERE NOT (p)-[:HAS_CONTRIBUTION]->(:Mosaic_Contribution)-[:MADE_BY]->(targetUser)
      
      CREATE (c:Mosaic_Contribution {
        id: 'contrib_' + timestamp() + '_' + targetUser.id,
        role: 'Collaborator',
        weight: 0,
        status: 'Pending'
      })
      CREATE (p)-[:HAS_CONTRIBUTION]->(c)
      CREATE (c)-[:MADE_BY]->(targetUser)
      
      RETURN c.id
    `;
    
    const rows = await runWrite(query, { documentId, creatorId, usernameToInvite: sanitizedUsername }, (row) => row);
    if (!rows.length) throw new Error('Failed to invite user (they may not exist or are already invited)');
  },

  async proposeSplits(documentId: string, creatorId: string, splits: { userId: string, role: string, weight: number }[]): Promise<void> {
    // 1. Verify creator
    // 2. Unwind splits, match contribution edges, update weights and role, set status to 'Pending' for all
    // 3. Set Piece status to 'Proposed'
    const query = `
      MATCH (p:Mosaic_Piece {id: $documentId})-[:CREATED_BY]->(creator:Mosaic_User {id: $creatorId})
      SET p.status = 'Proposed',
          p.publishStage = 'waiting'
      WITH p
      UNWIND $splits AS split
      MATCH (p)-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution)-[:MADE_BY]->(u:Mosaic_User {id: split.userId})
      SET c.weight = toFloat(split.weight),
          c.role = split.role,
          c.status = 'Pending',
          c.signatureHash = null
      RETURN count(c) AS updatedCount
    `;
    
    const rows = await runWrite(query, { documentId, creatorId, splits }, (row) => row.updatedCount);
    if (!rows.length) throw new Error('Failed to propose splits');
  },

  async signContribution(documentId: string, userId: string, signatureHash: string, walletAddress: string): Promise<void> {
    const query = `
      MATCH (p:Mosaic_Piece {id: $documentId})-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution)-[:MADE_BY]->(u:Mosaic_User {id: $userId})
      SET c.status = 'Signed',
          c.signatureHash = $signatureHash,
          c.walletAddress = $walletAddress
      RETURN c.id
    `;
    
    const rows = await runWrite(query, { documentId, userId, signatureHash, walletAddress }, (row) => row);
    if (!rows.length) throw new Error('Failed to sign contribution');
  },

  async publishDocumentToPiece(documentId: string, creatorId: string, communityId: string): Promise<string> {
    // Ensure all contributions are Signed
    const checkQuery = `
      MATCH (p:Mosaic_Piece {id: $documentId})-[:CREATED_BY]->(:Mosaic_User {id: $creatorId})
      MATCH (p)-[:HAS_CONTRIBUTION]->(c:Mosaic_Contribution)
      WITH p, count(c) AS totalContribs, sum(CASE WHEN c.status = 'Signed' THEN 1 ELSE 0 END) AS signedContribs
      RETURN totalContribs, signedContribs
    `;
    
    const checkRows = await runRead(checkQuery, { documentId, creatorId }, (row) => ({
      total: row.totalContribs as number,
      signed: row.signedContribs as number
    }));
    
    if (!checkRows.length) throw new Error('Document not found or unauthorized');
    if (checkRows[0].total !== checkRows[0].signed) throw new Error('Cannot publish: not all contributors have signed');

    // Link piece to community, set status to Published
    const publishQuery = `
      MATCH (p:Mosaic_Piece {id: $documentId})
      MATCH (c:Mosaic_Community {id: $communityId})
      SET p.status = 'Published'
      MERGE (p)-[:PUBLISHED_IN]->(c)
      RETURN p.id AS id
    `;

    const rows = await runWrite(publishQuery, { documentId, communityId }, (row) => row.id as string);
    if (!rows.length) throw new Error('Failed to link piece to community');
    return rows[0];
  },

  async addComment(documentId: string, userId: string, content: string): Promise<string> {
    const query = `
      MATCH (p:Mosaic_Piece {id: $documentId})
      MATCH (u:Mosaic_User {id: $userId})
      CREATE (c:Mosaic_DocumentComment {
        id: 'comment_' + timestamp() + '_' + u.id,
        content: $content,
        resolved: false,
        createdAt: timestamp()
      })
      CREATE (p)-[:HAS_COMMENT]->(c)
      CREATE (c)-[:AUTHORED_BY]->(u)
      RETURN c.id AS id
    `;
    
    const rows = await runWrite(query, { documentId, userId, content }, (row) => row.id as string);
    if (!rows.length) throw new Error('Failed to add comment');
    return rows[0];
  },

  async getComments(documentId: string): Promise<{ id: string, authorName: string, content: string, timestamp: string, resolved: boolean }[]> {
    const query = `
      MATCH (p:Mosaic_Piece {id: $documentId})-[:HAS_COMMENT]->(c:Mosaic_DocumentComment)-[:AUTHORED_BY]->(u:Mosaic_User)
      RETURN c, u
      ORDER BY c.createdAt ASC
    `;
    
    return runRead(query, { documentId }, (row) => {
      const c = row.c as Record<string, unknown>;
      const u = row.u as Record<string, unknown>;
      return {
        id: c.id as string,
        authorName: u.displayName as string,
        content: c.content as string,
        timestamp: new Date(c.createdAt as number).toLocaleString(),
        resolved: !!c.resolved
      };
    });
  }
};
