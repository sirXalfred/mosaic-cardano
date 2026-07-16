export interface ContributionDetails {
  id: string;
  userId: string;
  name: string;
  username: string;
  role: string;
  weight: number;
  status: 'Pending' | 'Signed';
  signatureHash?: string;
  walletAddress?: string;
}

export type PublishStep = 'draft' | 'community' | 'freezing' | 'propose' | 'waiting' | 'mint' | 'success';

export interface DocumentDetails {
  id: string;
  title: string;
  contentUrl: string;
  contentRaw?: string;
  createdAt: number;
  updatedAt: number;
  communityId?: string;
  status: string;
  publishStage?: PublishStep;
  ipfsHash?: string;
  ipfsManifest?: string;
  isMainnet?: number;
  creator?: {
    id: string;
    username: string;
  };
  contributions?: ContributionDetails[];
}

export interface PieceDetails {
  id: string;
  title: string;
  contentUrl: string;
  contentType: string;
  createdAt: number;
  community: {
    id: string;
    name: string;
  };
  ipfsHash?: string;
  ipfsManifest?: string;
  isMainnet?: number;
  contributors: {
    userId: string;
    name: string;
    username: string;
    role: string;
    weight: number;
  }[];
}

export interface DocumentComment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  blockId?: string; // Links comment to a specific paragraph/block
}
