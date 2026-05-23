import { useQuery } from '@tanstack/react-query';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const MOCK_USER_PROFILE = {
  id: 'david-artisan',
  displayName: 'David Artisan',
  handle: '@davidartisan',
  bio: 'Digital archivist and open-source weaver. Dedicated to preserving collective memory through immutable infrastructure.',
  joinedDate: 'December 2022',
  walletAddress: 'addr1q9...', // Simplified
};

export interface PublishedWork {
  id: string;
  title: string;
  type: string;
  community: string;
  date: string;
}

const MOCK_PUBLISHED_WORKS = [
  { id: '1', title: 'On the Ethics of Archives', type: 'Essay', community: 'Neo-Classical Agora', date: 'Oct 2023' },
  { id: '2', title: 'Protocol Governance Draft v2', type: 'Technical', community: 'Syntactic Weavers', date: 'Aug 2023' },
];

export interface UserProfile {
  id: string;
  displayName: string;
  handle: string;
  bio: string;
  joinedDate: string;
  walletAddress: string;
}

export interface PublishedWork {
  id: string;
  title: string;
  type: string;
  community: string;
  date: string;
}

const MOCK_CONTRIBUTIONS = [
  { id: '1', action: 'Drafted Artifact', target: 'Protocol Governance Draft v2', community: 'Syntactic Weavers', date: 'Aug 14, 2023', description: 'Proposed a mechanism for quadratic voting within the treasury.' },
  { id: '2', action: 'Merged Pull Request', target: 'Core Client UI', community: 'Syntactic Weavers', date: 'Jul 02, 2023', description: 'Implemented the new textured card component across the landing page.' },
  { id: '3', action: 'Peer Review', target: 'The Griot\'s Echo', community: 'Scribes of the Sahel', date: 'May 20, 2023', description: 'Reviewed translated stanzas 40-55 for historical accuracy.' },
];

export interface Contribution {
  id: string;
  action: string;
  target: string;
  community: string;
  date: string;
  description: string;
}

export interface Reputation {
  badges: UserRep[];
  skills: string[];
  communities: {
    id: string;
    name: string;
    role: string;
  }[];
  projects: string[];
  supportHistory: {
    id: string;
    type: string;
    amount: string;
    source: string;
    reason: string;
  }[];
}

export interface UserRep {
  id: string;
  name: string;
  icon: string;
}

const MOCK_REPUTATION = {
  badges: [
    { id: 'b1', name: 'Founding Weaver', icon: '⚡' },
    { id: 'b2', name: 'Verified Scholar', icon: '📜' },
    { id: 'b3', name: 'Treasury Signer', icon: '🏛️' },
  ],
  skills: ['React', 'Cryptography', 'Technical Writing', 'Governance Design'],
  communities: [
    { id: 'syntactic-weavers', name: 'Syntactic Weavers', role: 'Core Contributor' },
    { id: 'neo-classical-agora', name: 'Neo-Classical Agora', role: 'Member' },
  ],
  projects: ['Mosaic Core', 'Decentralized Identity Spec'],
  supportHistory: [
    { id: 's1', type: 'Received', amount: '5,000 ADA', source: 'Project Catalyst', reason: 'Open Source Development' },
  ]
};

export const useGetUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      await delay(500);
      return MOCK_USER_PROFILE; // In real life, fetch by userId
    }
  });
};

export const useGetUserPublishedWorks = (userId: string) => {
  return useQuery({
    queryKey: ['userWorks', userId],
    queryFn: async () => {
      await delay(600);
      return MOCK_PUBLISHED_WORKS;
    }
  });
};

export const useGetUserContributions = (userId: string) => {
  return useQuery({
    queryKey: ['userContributions', userId],
    queryFn: async () => {
      await delay(700);
      return MOCK_CONTRIBUTIONS;
    }
  });
};

export const useGetUserReputation = (userId: string) => {
  return useQuery({
    queryKey: ['userReputation', userId],
    queryFn: async () => {
      await delay(650);
      return MOCK_REPUTATION;
    }
  });
};
