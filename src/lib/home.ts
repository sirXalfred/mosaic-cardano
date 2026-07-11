import { formatDistanceToNowStrict } from 'date-fns';
import { z } from 'zod';

import type {
  HomeActionItem as HomeActionItemView,
  HomeCommunityUpdate as HomeCommunityUpdateView,
  HomeProjectSummary as HomeProjectSummaryView,
  SavedItemSummary as SavedItemSummaryView,
} from '@/services/home';

const HomeActionItemResponseSchema = z.object({
  id: z.string(),
  type: z.enum(['INVITE', 'MENTION', 'PROJECT_UPDATE']),
  title: z.string(),
  description: z.string(),
  timestamp: z.number(),
  source: z.string(),
  link: z.string(),
});

const HomeProjectSummaryResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  community: z.string(),
  description: z.string(),
  progress: z.number(),
  lastActivityAt: z.number(),
  collaborators: z.array(z.string()),
  link: z.string(),
});

const HomeCommunityUpdateResponseSchema = z.object({
  id: z.string(),
  type: z.enum(['governance', 'discussion', 'treasury']),
  community: z.string(),
  title: z.string(),
  description: z.string(),
  timestamp: z.number(),
  status: z.string(),
  link: z.string(),
});

const SavedItemSummaryResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  author: z.string(),
  link: z.string(),
});

const ListResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  items: z.array(itemSchema),
});

export const HOME_QUERY_KEYS = {
  ACTION_ITEMS: ['home', 'action_items'],
  ACTIVE_PROJECTS: ['home', 'active_projects'],
  COMMUNITY_UPDATES: ['home', 'community_updates'],
  SAVED_ITEMS: ['home', 'saved_items'],
  PENDING_SIGNATURES: ['home', 'pending_signatures'],
} as const;

export const ACTION_ITEM_TYPE_LABELS = {
  INVITE: 'Invitation',
  MENTION: 'Mention',
  PROJECT_UPDATE: 'Project Update',
} as const;

export const formatRelativeTimestamp = (timestamp: number | null | undefined): string => {
  if (!timestamp) return 'Just now';
  return formatDistanceToNowStrict(timestamp, { addSuffix: true });
};

export const parseHomeActionItems = (payload: unknown): HomeActionItemView[] => {
  const parsed = ListResponseSchema(HomeActionItemResponseSchema).parse(payload);
  return parsed.items.map(item => ({
    ...item,
    timestamp: formatRelativeTimestamp(item.timestamp),
  }));
};

export const parseHomeActiveProjects = (payload: unknown): HomeProjectSummaryView[] => {
  const parsed = ListResponseSchema(HomeProjectSummaryResponseSchema).parse(payload);
  return parsed.items.map(({ lastActivityAt, ...item }) => ({
    ...item,
    lastActivity: `Updated ${formatRelativeTimestamp(lastActivityAt)}`,
  }));
};

export const parseHomeCommunityUpdates = (payload: unknown): HomeCommunityUpdateView[] => {
  const parsed = ListResponseSchema(HomeCommunityUpdateResponseSchema).parse(payload);
  return parsed.items.map(item => ({
    ...item,
    timestamp: formatRelativeTimestamp(item.timestamp),
  }));
};

export const parseSavedItems = (payload: unknown): SavedItemSummaryView[] => {
  const parsed = ListResponseSchema(SavedItemSummaryResponseSchema).parse(payload);
  return parsed.items;
};

export type {
  HomeActionItemResponseSchema,
  HomeProjectSummaryResponseSchema,
  HomeCommunityUpdateResponseSchema,
  SavedItemSummaryResponseSchema,
};