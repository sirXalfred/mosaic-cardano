import { runRead, runWrite } from './shared';

export type PostResponse = {
  id: string;
  content: string;
  score: number;
  replyCount: number;
  createdAt: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  communityId: string;
  isPinned: boolean;
  viewerVote: 'UP' | 'DOWN' | 'NONE';
};

export const postService = {
  async createPost(communityId: string, authorId: string, content: string, replyToId?: string): Promise<PostResponse | null> {
    const postId = crypto.randomUUID();
    const timestamp = Date.now();

    const query = `
      MATCH (c:Mosaic_Community {id: $communityId})
      MATCH (u:Mosaic_User {id: $authorId})
      CREATE (p:Mosaic_Post {
        id: $postId,
        communityId: $communityId,
        authorId: $authorId,
        content: $content,
        score: 0,
        replyCount: 0,
        isPinned: false,
        createdAt: $timestamp
      })
      CREATE (u)-[:AUTHORED]->(p)
      CREATE (p)-[:POSTED_IN]->(c)
      
      WITH p, u
      OPTIONAL MATCH (parent:Mosaic_Post {id: $replyToId})
      FOREACH (ignoreMe IN CASE WHEN parent IS NOT NULL THEN [1] ELSE [] END |
        CREATE (p)-[:REPLIED_TO]->(parent)
        SET parent.replyCount = coalesce(parent.replyCount, 0) + 1
      )

      RETURN p AS post, u AS author
    `;

    const rows = await runWrite(query, { communityId, authorId, content, postId, timestamp, replyToId: replyToId || null }, (row) => row);

    if (rows.length === 0) return null;

    const post = rows[0].post as Record<string, unknown>;
    const author = rows[0].author as Record<string, unknown>;

    return {
      id: post.id as string,
      content: post.content as string,
      score: post.score as number,
      replyCount: post.replyCount as number,
      createdAt: post.createdAt as number,
      author: {
        id: author.id as string,
        name: author.displayName as string || author.name as string,
        username: author.username as string,
        avatarUrl: (author.avatarUrl || author.profileImageUrl || null) as string | null,
      },
      communityId: post.communityId as string,
      isPinned: post.isPinned as boolean || false,
      viewerVote: 'NONE'
    };
  },

  async listPosts(communityId: string, viewerId: string | null, limit = 50, offset = 0, filter?: string): Promise<PostResponse[]> {
    let whereClause = `WHERE NOT (p)-[:REPLIED_TO]->()`;
    let orderClause = `ORDER BY p.createdAt DESC`;

    if (filter === 'Top') {
      orderClause = `ORDER BY p.score DESC, p.createdAt DESC`;
    } else if (filter === 'Announcements') {
      whereClause += ` AND p.isPinned = true`;
    } else if (filter === 'Pieces') {
      whereClause += ` AND (p.content CONTAINS 'mosaic://piece/' OR p.content CONTAINS 'mosaic://publication/')`;
    }

    const query = `
      MATCH (p:Mosaic_Post {communityId: $communityId})<-[:AUTHORED]-(author:Mosaic_User)
      ${whereClause}
      OPTIONAL MATCH (viewer:Mosaic_User {id: $viewerId})
      OPTIONAL MATCH (viewer)-[up:UPVOTED]->(p)
      OPTIONAL MATCH (viewer)-[down:DOWNVOTED]->(p)
      RETURN p AS post, author, up IS NOT NULL AS isUpvoted, down IS NOT NULL AS isDownvoted
      ${orderClause}
      SKIP toInteger($offset)
      LIMIT toInteger($limit)
    `;

    return runRead(query, { communityId, viewerId: viewerId || '', limit, offset }, (row) => {
      const post = row.post as Record<string, unknown>;
      const author = row.author as Record<string, unknown>;
      const isUpvoted = row.isUpvoted as boolean;
      const isDownvoted = row.isDownvoted as boolean;

      let viewerVote: 'UP' | 'DOWN' | 'NONE' = 'NONE';
      if (isUpvoted) viewerVote = 'UP';
      else if (isDownvoted) viewerVote = 'DOWN';

      return {
        id: post.id as string,
        content: post.content as string,
        score: typeof post.score === 'number' ? post.score : 0,
        replyCount: typeof post.replyCount === 'number' ? post.replyCount : 0,
        createdAt: post.createdAt as number,
        author: {
          id: author.id as string,
          name: author.displayName as string || author.name as string,
          username: author.username as string,
          avatarUrl: (author.avatarUrl || author.profileImageUrl || null) as string | null,
        },
        communityId: post.communityId as string,
        isPinned: post.isPinned as boolean || false,
        viewerVote
      };
    });
  },

  async getPostReplies(postId: string, viewerId: string | null, limit = 10, offset = 0): Promise<PostResponse[]> {
    const query = `
      MATCH (p:Mosaic_Post)-[:REPLIED_TO]->(:Mosaic_Post {id: $postId})
      MATCH (p)<-[:AUTHORED]-(author:Mosaic_User)
      OPTIONAL MATCH (viewer:Mosaic_User {id: $viewerId})
      OPTIONAL MATCH (viewer)-[up:UPVOTED]->(p)
      OPTIONAL MATCH (viewer)-[down:DOWNVOTED]->(p)
      RETURN p AS post, author, up IS NOT NULL AS isUpvoted, down IS NOT NULL AS isDownvoted
      ORDER BY p.score DESC, p.createdAt DESC
      SKIP toInteger($offset)
      LIMIT toInteger($limit)
    `;

    return runRead(query, { postId, viewerId: viewerId || '', limit, offset }, (row) => {
      const post = row.post as Record<string, unknown>;
      const author = row.author as Record<string, unknown>;
      const isUpvoted = row.isUpvoted as boolean;
      const isDownvoted = row.isDownvoted as boolean;

      let viewerVote: 'UP' | 'DOWN' | 'NONE' = 'NONE';
      if (isUpvoted) viewerVote = 'UP';
      else if (isDownvoted) viewerVote = 'DOWN';

      return {
        id: post.id as string,
        content: post.content as string,
        score: typeof post.score === 'number' ? post.score : 0,
        replyCount: typeof post.replyCount === 'number' ? post.replyCount : 0,
        createdAt: post.createdAt as number,
        author: {
          id: author.id as string,
          name: author.displayName as string || author.name as string,
          username: author.username as string,
          avatarUrl: (author.avatarUrl || author.profileImageUrl || null) as string | null,
        },
        communityId: post.communityId as string,
        isPinned: post.isPinned as boolean || false,
        viewerVote
      };
    });
  },

  async getPostThread(postId: string, viewerId: string | null): Promise<PostResponse[]> {
    const query = `
      MATCH path = (target:Mosaic_Post {id: $postId})-[:REPLIED_TO*0..]->(root:Mosaic_Post)
      WHERE NOT (root)-[:REPLIED_TO]->()
      UNWIND nodes(path) AS p
      MATCH (p)<-[:AUTHORED]-(author:Mosaic_User)
      OPTIONAL MATCH (viewer:Mosaic_User {id: $viewerId})
      OPTIONAL MATCH (viewer)-[up:UPVOTED]->(p)
      OPTIONAL MATCH (viewer)-[down:DOWNVOTED]->(p)
      RETURN p AS post, author, up IS NOT NULL AS isUpvoted, down IS NOT NULL AS isDownvoted
    `;

    const nodes = await runRead(query, { postId, viewerId: viewerId || '' }, (row) => {
      const post = row.post as Record<string, unknown>;
      const author = row.author as Record<string, unknown>;
      const isUpvoted = row.isUpvoted as boolean;
      const isDownvoted = row.isDownvoted as boolean;

      let viewerVote: 'UP' | 'DOWN' | 'NONE' = 'NONE';
      if (isUpvoted) viewerVote = 'UP';
      else if (isDownvoted) viewerVote = 'DOWN';

      return {
        id: post.id as string,
        content: post.content as string,
        score: typeof post.score === 'number' ? post.score : 0,
        replyCount: typeof post.replyCount === 'number' ? post.replyCount : 0,
        createdAt: post.createdAt as number,
        author: {
          id: author.id as string,
          name: author.displayName as string || author.name as string,
          username: author.username as string,
          avatarUrl: (author.avatarUrl || author.profileImageUrl || null) as string | null,
        },
        communityId: post.communityId as string,
        isPinned: post.isPinned as boolean || false,
        viewerVote
      };
    });

    // The query returns [target, parent, root], reverse it to be [root, parent, target]
    return nodes.reverse();
  },

  async voteOnPost(postId: string, userId: string, direction: 'UP' | 'DOWN' | 'NONE'): Promise<{ score: number, viewerVote: 'UP' | 'DOWN' | 'NONE' } | null> {
    const timestamp = Date.now();

    // Atomically delete old votes and set new one, then recalculate score
    const safeQuery = `
      MATCH (p:Mosaic_Post {id: $postId}), (u:Mosaic_User {id: $userId})
      OPTIONAL MATCH (u)-[oldUp:UPVOTED]->(p)
      OPTIONAL MATCH (u)-[oldDown:DOWNVOTED]->(p)
      DELETE oldUp, oldDown
      WITH p, u
      
      FOREACH (ignoreMe IN CASE WHEN $direction = 'UP' THEN [1] ELSE [] END |
        CREATE (u)-[:UPVOTED {createdAt: $timestamp}]->(p)
      )
      FOREACH (ignoreMe IN CASE WHEN $direction = 'DOWN' THEN [1] ELSE [] END |
        CREATE (u)-[:DOWNVOTED {createdAt: $timestamp}]->(p)
      )
      
      WITH p
      OPTIONAL MATCH ()-[up:UPVOTED]->(p)
      WITH p, count(up) AS ups
      OPTIONAL MATCH ()-[down:DOWNVOTED]->(p)
      WITH p, ups, count(down) AS downs
      
      SET p.score = ups - downs
      RETURN p.score AS score
    `;

    const rows = await runWrite(safeQuery, { postId, userId, direction, timestamp }, (row) => row);

    if (rows.length === 0) return null;

    return {
      score: rows[0].score as number,
      viewerVote: direction
    };
  },

  async pinPost(postId: string, userId: string, isPinned: boolean): Promise<PostResponse | null> {
    const query = `
      MATCH (u:Mosaic_User {id: $userId})-[m:MEMBER_OF]->(c:Mosaic_Community)<-[:POSTED_IN]-(p:Mosaic_Post {id: $postId})
      WHERE m.role = 'ADMIN'
      SET p.isPinned = $isPinned
      WITH p, c, u
      MATCH (p)<-[:AUTHORED]-(author:Mosaic_User)
      OPTIONAL MATCH (viewer:Mosaic_User {id: $userId})
      OPTIONAL MATCH (viewer)-[up:UPVOTED]->(p)
      OPTIONAL MATCH (viewer)-[down:DOWNVOTED]->(p)
      RETURN p AS post, author, up IS NOT NULL AS isUpvoted, down IS NOT NULL AS isDownvoted
    `;

    const rows = await runWrite(query, { postId, userId, isPinned }, (row) => row);

    if (rows.length === 0) return null; // Not found, or user is not ADMIN

    const post = rows[0].post as Record<string, unknown>;
    const author = rows[0].author as Record<string, unknown>;
    const isUpvoted = rows[0].isUpvoted as boolean;
    const isDownvoted = rows[0].isDownvoted as boolean;

    let viewerVote: 'UP' | 'DOWN' | 'NONE' = 'NONE';
    if (isUpvoted) viewerVote = 'UP';
    else if (isDownvoted) viewerVote = 'DOWN';

    return {
      id: post.id as string,
      content: post.content as string,
      score: typeof post.score === 'number' ? post.score : 0,
      replyCount: typeof post.replyCount === 'number' ? post.replyCount : 0,
      createdAt: post.createdAt as number,
      author: {
        id: author.id as string,
        name: author.displayName as string || author.name as string,
        username: author.username as string,
        avatarUrl: (author.avatarUrl || author.profileImageUrl || null) as string | null,
      },
      communityId: post.communityId as string,
      isPinned: post.isPinned as boolean || false,
      viewerVote
    };
  }
};
