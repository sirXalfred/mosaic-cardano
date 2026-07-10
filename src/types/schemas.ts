import { z } from 'zod';

export const TimestampSchema = z.number().int().nonnegative();
export const UUIDSchema = z.string().uuid();

export const MemberRoleSchema = z.enum(['ADMIN', 'MEMBER']);
export const NotificationTypeSchema = z.enum([
  'SYSTEM',
  'INVITE',
  'MENTION',
  'FOLLOW',
  'PROJECT_UPDATE',
  'SIGNATURE_REQUEST',
  'PIECE_UPDATE',
  'VILLAGE_ANNOUNCEMENT',
  'UPVOTE',
  'COMMUNITY_MEMBER_JOINED',
]);

export const AuthProviderSchema = z.enum(['LOCAL', 'OAUTH', 'WALLET']);

// Node Schemas

export const UserNodeSchema = z.object({
  id: UUIDSchema,
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1),
  bio: z.string().max(500).optional(),
  walletAddress: z.string().optional(),
  isVerified: z.boolean().default(false),
  isOnboarded: z.boolean().default(false),
  planType: z.enum(['FREE', 'BASIC', 'PRO', 'CUSTOM']).default('FREE'),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).default('USER'),
  settings: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const CommunityNodeSchema = z.object({
  id: UUIDSchema,
  slug: z.string().min(2).max(80),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable(),
  profileImageUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().default(true),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional().nullable(),
});

export const ProjectNodeSchema = z.object({
  id: UUIDSchema,
  communityId: UUIDSchema,
  ownerId: UUIDSchema,
  title: z.string().min(3).max(100),
  description: z.string().max(500).default(''),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const PieceNodeSchema = z.object({
  id: UUIDSchema,
  communityId: UUIDSchema,
  authorId: UUIDSchema,
  title: z.string().min(1),
  contentUrl: z.string().url(),
  contentType: z.enum(['TEXT', 'AUDIO', 'IMAGE', 'VIDEO', 'CODE', 'OTHER']).default('OTHER'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const PostNodeSchema = z.object({
  id: UUIDSchema,
  communityId: UUIDSchema.optional(),
  authorId: UUIDSchema,
  content: z.string().min(1).max(5000),
  score: z.number().int().default(0),
  replyCount: z.number().int().default(0),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const DocumentCommentNodeSchema = z.object({
  id: UUIDSchema,
  documentId: UUIDSchema,
  authorId: UUIDSchema,
  content: z.string().min(1).max(2000),
  resolved: z.boolean().default(false),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const SkillNodeSchema = z.object({
  name: z.string().trim().toLowerCase().min(1).max(80),
  createdAt: TimestampSchema.optional(),
});

export const TopicNodeSchema = z.object({
  name: z.string().trim().toLowerCase().min(1).max(80),
  createdAt: TimestampSchema.optional(),
});

export const NotificationNodeSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  type: NotificationTypeSchema,
  title: z.string().min(1).max(140),
  body: z.string().max(1000).optional(),
  isRead: z.boolean().default(false),
  aggregationKey: z.string().optional(),
  actionUrl: z.string().optional(),
  actors: z.array(z.string()).default([]),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const CredentialNodeSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  email: z.string().email().toLowerCase(),
  passwordHash: z.string().min(20),
  provider: AuthProviderSchema.default('LOCAL'),
  lastLoginAt: TimestampSchema.optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const PagedResultMetaSchema = z.object({
  limit: z.number().int().positive(),
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export const InviteNodeSchema = z.object({
  id: UUIDSchema,
  hash: z.string().min(1),
  communityId: UUIDSchema,
  inviterId: UUIDSchema,
  createdAt: TimestampSchema,
  expiresAt: TimestampSchema.optional(),
});


// Relationship Schemas
export const MemberOfEdgeSchema = z.object({
  role: MemberRoleSchema.default('MEMBER'),
  joinedAt: TimestampSchema,
});

export const FollowsEdgeSchema = z.object({
  createdAt: TimestampSchema,
  isMuted: z.boolean().default(false),
});

export const ViewedEdgeSchema = z.object({
  timestamp: TimestampSchema,
  durationSeconds: z.number().min(0),
});

export const ContributedToEdgeSchema = z.object({
  role: z.string().min(1).max(100),
  createdAt: TimestampSchema,
});

export const SavedEdgeSchema = z.object({
  createdAt: TimestampSchema,
});

export const TaggedWithEdgeSchema = z.object({
  createdAt: TimestampSchema,
});

export const UpvotedEdgeSchema = z.object({
  createdAt: TimestampSchema,
});

export const DownvotedEdgeSchema = z.object({
  createdAt: TimestampSchema,
});

export const RepliedToEdgeSchema = z.object({
  createdAt: TimestampSchema,
});

export const InvitedByEdgeSchema = z.object({
  createdAt: TimestampSchema,
});


export type UserNode = z.infer<typeof UserNodeSchema>;
export type CommunityNode = z.infer<typeof CommunityNodeSchema>;
export type ProjectNode = z.infer<typeof ProjectNodeSchema>;
export type PieceNode = z.infer<typeof PieceNodeSchema>;
export type SkillNode = z.infer<typeof SkillNodeSchema>;
export type TopicNode = z.infer<typeof TopicNodeSchema>;
export type NotificationNode = z.infer<typeof NotificationNodeSchema>;
export type CredentialNode = z.infer<typeof CredentialNodeSchema>;
export type PagedResultMeta = z.infer<typeof PagedResultMetaSchema>;
export type MemberOfEdge = z.infer<typeof MemberOfEdgeSchema>;
export type FollowsEdge = z.infer<typeof FollowsEdgeSchema>;
export type ViewedEdge = z.infer<typeof ViewedEdgeSchema>;
export type ContributedToEdge = z.infer<typeof ContributedToEdgeSchema>;
export type SavedEdge = z.infer<typeof SavedEdgeSchema>;
export type TaggedWithEdge = z.infer<typeof TaggedWithEdgeSchema>;
export type AuthProvider = z.infer<typeof AuthProviderSchema>;
export type PostNode = z.infer<typeof PostNodeSchema>;
export type UpvotedEdge = z.infer<typeof UpvotedEdgeSchema>;
export type DownvotedEdge = z.infer<typeof DownvotedEdgeSchema>;
export type RepliedToEdge = z.infer<typeof RepliedToEdgeSchema>;
export type InviteNode = z.infer<typeof InviteNodeSchema>;
export type InvitedByEdge = z.infer<typeof InvitedByEdgeSchema>;