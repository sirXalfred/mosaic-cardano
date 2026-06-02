import { formatDistanceToNowStrict } from 'date-fns';

type RawResponse = unknown;

export interface NormalizedExploreItem {
  id: string;
  title: string;
  description?: string;
  communityId?: string;
  communityName?: string | null;
  imageUrl?: string | null;
  members?: number | null;
  location?: string | null;
  type?: string | null;
  topic?: string | null;
  details?: Record<string, unknown> | null;
  visibility?: string | null;
  format?: string | null;
  isMember?: boolean;
  lastActivity?: string | null;
}

const safeToNumber = (v: unknown) => {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const parseExploreItem = (raw: Record<string, string | number | null>): NormalizedExploreItem => {
  const id = raw?.id || raw?.communityId || String(raw?.key || '') || '';
  const title = raw?.title || raw?.name || raw?.communityName || '';
  const description = raw?.description || raw?.desc || raw?.summary || undefined;
  const communityId = raw?.communityId || raw?.id || null;
  const communityName = raw?.name || null;
  const imageUrl = raw?.profileImageUrl || raw?.imageUrl || raw?.iconUrl || null;
  const members = safeToNumber(raw?.members ?? raw?.memberCount ?? raw?.membersCount ?? null);
  const location = raw?.location || null;
  const type = raw?.type || null;
  const topic = raw?.topic || raw?.category || null;
  const rawDetails = raw?.details ?? raw?.meta ?? null;
  const details = typeof rawDetails === 'object' && rawDetails !== null ? (rawDetails as Record<string, unknown>) : null;
  const visibility = raw?.visibility || null;
  const format = raw?.format || null;
  const isMember = Boolean(raw?.isMember ?? false);

  const lastActivityAt = raw?.lastActivityAt || raw?.timestamp || raw?.publishedDate || raw?.createdAt || null;
  const lastActivity = lastActivityAt ? `${formatDistanceToNowStrict(new Date(lastActivityAt))} ago` : null;

  return {
    id: String(id),
    title: String(title),
    description: String(description || ''),
    communityId: communityId ? String(communityId) : undefined,
    communityName: communityName ? String(communityName) : undefined,
    imageUrl: imageUrl ? String(imageUrl) : undefined,
    members,
    location: location ? String(location) : undefined,
    type: type ? String(type) : undefined,
    topic: topic ? String(topic) : undefined,
    details: details ?? undefined,
    visibility: visibility ? String(visibility) : undefined,
    format: format ? String(format) : undefined,
    isMember,
    lastActivity,
  };
};

export type ExplorePageMeta = {
  hasMore: boolean;
  nextOffset: number;
  pageSize: number;
};

export type ExplorePageResponse = {
  items: NormalizedExploreItem[];
  meta: ExplorePageMeta;
};

export const parseExploreList = (res: RawResponse): NormalizedExploreItem[] => {
  if (!res) return [];
  const resp = res as Array<Record<string, string | number | null>> | Record<string, unknown>;


  // Accept arrays directly
  const array = Array.isArray(resp)
    ? resp
    : Array.isArray(resp?.items)
    ? resp.items
    : Array.isArray(resp?.data)
    ? resp.data
    : Array.isArray(resp?.results)
    ? resp.results
    : Array.isArray(resp?.rows)
    ? resp.rows
    : null;

  if (!array) return [];

  return array.map((it: Record<string, string | number | null>) => parseExploreItem(it));
};

export default parseExploreList;
