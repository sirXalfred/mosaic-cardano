export const ROUTES = {
  HOME: '/home',
  ONBOARDING: '/onboarding',
  EXPLORE: '/explore',
  AUTH: '/auth',
  NEW_COMMUNITY: '/new',
  SETTINGS: '/settings',
  SUPPORT: '/support',
  STUDIO: '/studio',
  PROFILE: '/profile', // generic profile
  NOTIFICATIONS: '/notifications',
  ARTIFACT: (id: string) => `/artifact/${id}`,

  USER: (id: string, currentUserId?: string) => id === currentUserId ? '/profile' : `/u/${id}`,

  VILLAGE: {
    HOME: (villageId: string) => `/v/${villageId}`,
    TOWNSQUARE: (villageId: string) => `/v/${villageId}/town-square`,
    PROJECTS: (villageId: string) => `/v/${villageId}/projects`,
    PROJECT: (villageId: string, projectId: string) => `/v/${villageId}/project/${projectId}`,
    LIBRARY: (villageId: string) => `/v/${villageId}/library`,
    FEED: (villageId: string) => `/v/${villageId}/feed`,
    TREASURY: (villageId: string) => `/v/${villageId}/treasury`,
    GOVERNANCE: (villageId: string) => `/v/${villageId}/governance`,
    MEMBERS: (villageId: string) => `/v/${villageId}/members`,
    RESOURCES: (villageId: string) => `/v/${villageId}/resources`,
    SETTINGS: (villageId: string) => `/v/${villageId}/settings`,
  },



} as const;
