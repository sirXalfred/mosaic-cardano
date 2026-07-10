import { z } from 'zod';
import {
  PieceNodeSchema,
  CommunityNodeSchema,
  NotificationNodeSchema,
  PagedResultMetaSchema,
  // ProjectNodeSchema,
  UserNodeSchema,
  UUIDSchema,
} from './schemas';


// Action: Finish Onboarding
export const OnboardingRequestSchema = z.object({
  userId: UUIDSchema,
  skills: z.array(z.string().min(1)).min(1),
  topics: z.array(z.string().min(1)).min(1),
  communities: z.array(UUIDSchema),
});


// Action: Publish Piece
export const PublishPieceRequestSchema = z.object({
  userId: UUIDSchema,
  communityId: UUIDSchema,
  // Pick the fields needed to create a piece, and add custom parameters
  pieceData: PieceNodeSchema.pick({ title: true, contentUrl: true, contentType: true }).partial({ contentType: true }),
});

export const FollowUserRequestSchema = z.object({
  followerId: UUIDSchema,
  targetUserId: UUIDSchema,
});

export const UnfollowUserRequestSchema = FollowUserRequestSchema;

export const JoinCommunityRequestSchema = z.object({
  userId: UUIDSchema,
  communityId: UUIDSchema,
  inviterId: UUIDSchema.optional(),
});

export const LeaveCommunityRequestSchema = JoinCommunityRequestSchema;

export const CreateProjectRequestSchema = z.object({
  ownerId: UUIDSchema,
  communityId: UUIDSchema,
  title: z.string().min(3).max(100),
  description: z.string().max(500).default(''),
});

export const CreateNotificationRequestSchema = z.object({
  userId: UUIDSchema,
  type: NotificationNodeSchema.shape.type,
  title: z.string().min(1).max(140),
  body: z.string().max(1000).optional(),
  aggregationKey: z.string().optional(),
  actionUrl: z.string().optional(),
});

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});

export const NotificationsResponseSchema = z.object({
  items: z.array(NotificationNodeSchema),
  meta: PagedResultMetaSchema,
});

export const RecommendedCommunitiesResponseSchema = z.object({
  items: z.array(CommunityNodeSchema),
});

export const RegisterWithPasswordRequestSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores (no @ symbols)"),
  displayName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const LoginWithPasswordRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  ipAddress: z.string().optional(),
});

export const AuthUserResponseSchema = z.object({
  user: UserNodeSchema,
});

export const AuthStateResponseSchema = z.object({
  isAuthenticated: z.boolean(),
  user: z
    .object({
      id: z.string().uuid(),
      username: z.string().min(3),
      name: z.string().min(1),
      initials: z.string().min(1).max(3),
      avatarUrl: z.string().url().nullable(),
      isOnboarded: z.boolean().default(false),
      planType: z.string().default('FREE'),
    })
    .nullable(),
});

export type OnboardingRequest = z.infer<typeof OnboardingRequestSchema>;
export type PublishPieceRequest = z.infer<typeof PublishPieceRequestSchema>;
export type FollowUserRequest = z.infer<typeof FollowUserRequestSchema>;
export type UnfollowUserRequest = z.infer<typeof UnfollowUserRequestSchema>;
export type JoinCommunityRequest = z.infer<typeof JoinCommunityRequestSchema>;
export type LeaveCommunityRequest = z.infer<typeof LeaveCommunityRequestSchema>;
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
export type CreateNotificationRequest = z.infer<typeof CreateNotificationRequestSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type NotificationsResponse = z.infer<typeof NotificationsResponseSchema>;
export type RecommendedCommunitiesResponse = z.infer<typeof RecommendedCommunitiesResponseSchema>;
export type RegisterWithPasswordRequest = z.infer<typeof RegisterWithPasswordRequestSchema>;
export type LoginWithPasswordRequest = z.infer<typeof LoginWithPasswordRequestSchema>;
export type AuthUserResponse = z.infer<typeof AuthUserResponseSchema>;
export type AuthStateResponse = z.infer<typeof AuthStateResponseSchema>;