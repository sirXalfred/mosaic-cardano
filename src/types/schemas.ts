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
]);

export const AuthProviderSchema = z.enum(['LOCAL', 'OAUTH', 'WALLET']);

// Node Schemas

export const UserNodeSchema = z.object({
  id: UUIDSchema,
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1),
  isOnboarded: z.boolean().default(false),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
});

export const CommunityNodeSchema = z.object({
  id: UUIDSchema,
  slug: z.string().min(2).max(80),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema.optional(),
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

export const ArtifactNodeSchema = z.object({
  id: UUIDSchema,
  projectId: UUIDSchema,
  authorId: UUIDSchema,
  title: z.string().min(1),
  contentUrl: z.string().url(),
  contentType: z.enum(['TEXT', 'AUDIO', 'IMAGE', 'VIDEO', 'CODE', 'OTHER']).default('OTHER'),
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
  createdAt: TimestampSchema,
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



export type UserNode = z.infer<typeof UserNodeSchema>;
export type CommunityNode = z.infer<typeof CommunityNodeSchema>;
export type ProjectNode = z.infer<typeof ProjectNodeSchema>;
export type ArtifactNode = z.infer<typeof ArtifactNodeSchema>;
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