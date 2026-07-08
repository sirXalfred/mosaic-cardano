import { z } from 'zod';

export const defaultUserSettings = {
  profile: {
    showBadges: true,
    showCommunities: true,
  },
  privacy: {
    discoverable: true,
    allowMessagesFrom: 'EVERYONE' as const,
  },
  feed: {
    autoplayMedia: true,
    defaultView: 'CARD' as const,
  },
  notifications: {
    inAppMentions: true,
    pushMentions: true,
    inAppReplies: true,
    pushReplies: false,
    inAppUpvotes: true,
    pushUpvotes: false,
    inAppCommunityAlerts: true,
    pushCommunityAlerts: true,
    inAppSignatureRequests: true,
    pushSignatureRequests: true,
    inAppPieceUpdates: true,
    pushPieceUpdates: false,
    inAppSystemUpdates: true,
    pushSystemUpdates: true,
  },
};

export const UserSettingsSchema = z.object({
  profile: z.object({
    showBadges: z.boolean().default(true),
    showCommunities: z.boolean().default(true),
  }).default(defaultUserSettings.profile),
  privacy: z.object({
    discoverable: z.boolean().default(true),
    allowMessagesFrom: z.enum(['EVERYONE', 'NOBODY']).default('EVERYONE'),
  }).default(defaultUserSettings.privacy),
  feed: z.object({
    autoplayMedia: z.boolean().default(true),
    defaultView: z.enum(['CARD', 'COMPACT']).default('CARD'),
  }).default(defaultUserSettings.feed),
  notifications: z.object({
    inAppMentions: z.boolean().default(true),
    pushMentions: z.boolean().default(true),
    inAppReplies: z.boolean().default(true),
    pushReplies: z.boolean().default(false),
    inAppUpvotes: z.boolean().default(true),
    pushUpvotes: z.boolean().default(false),
    inAppCommunityAlerts: z.boolean().default(true),
    pushCommunityAlerts: z.boolean().default(true),
    inAppSignatureRequests: z.boolean().default(true),
    pushSignatureRequests: z.boolean().default(true),
    inAppPieceUpdates: z.boolean().default(true),
    pushPieceUpdates: z.boolean().default(false),
    inAppSystemUpdates: z.boolean().default(true),
    pushSystemUpdates: z.boolean().default(true),
  }).default(defaultUserSettings.notifications),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
