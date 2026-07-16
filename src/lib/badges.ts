export interface BadgeConfig {
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export const BADGE_MAP: Record<string, BadgeConfig> = {
  'early-user': {
    slug: 'early-user',
    name: 'Early User',
    icon: '🌱',
    description: 'Completed onboarding during the beta phase.',
  },
  'early-adopter': {
    slug: 'early-adopter',
    name: 'Early Adopter',
    icon: '🚀',
    description: 'Created a village during the beta phase.',
  },
  'first-post': {
    slug: 'first-post',
    name: 'Town Crier',
    icon: '📢',
    description: 'Published first post within a community.',
  },
  'first-feedback': {
    slug: 'first-feedback',
    name: 'Pioneer Voice',
    icon: '🗣️',
    description: 'Provided constructive early feedback to the platform.',
  },
  'first-invite': {
    slug: 'first-invite',
    name: 'The Welcomer',
    icon: '🤝',
    description: 'Invited a new user to a community.',
  },
  'first-document': {
    slug: 'first-document',
    name: 'Archivist',
    icon: '📜',
    description: 'Published a piece of work in the studio.',
  },
};

export const getBadgeConfig = (slug: string): BadgeConfig => {
  return BADGE_MAP[slug] || {
    slug,
    name: slug,
    icon: '🏅',
    description: 'An earned community badge.',
  };
};


export const BADGE_ASSETS: Record<string, string> = {
  'early-user': 'ipfs://bafybeib5g2sm2sqrbjtawhybbvkmx4umbzes3wlqk67rz6gvu44gqxaaz4',
  'early-adopter': 'ipfs://bafybeiatlymsxt4fcjdy3jol746ech6bjdsp54wpjatwktr5iseksp7ege',
  'first-post': 'ipfs://bafybeiefn3uw4tm5jfxdqyqhugnx5gut2jk7xolawed4vdyoiicjrhutz4',
  'first-feedback': 'ipfs://bafybeid66nl352ndjjmw63cyoe6i2xkpqijyz7rorglcg3rmooa6zwrvmy',
  'first-invite': 'ipfs://bafybeihvwkopwhtqyv3og2bsyy3475gip3shdkcqg2x6nqde2glwuqtena',
  'first-document': 'ipfs://bafybeigfu4ddw5sysjg6rj5jzeyubyjqoazz5briekgsu45e5itpoiwxgi'
};