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
  VILLAGE: (id: string) => `/v/${id}`,
  USER: (id: string, currentUserId?: string) => id === currentUserId ? '/profile' : `/u/${id}`,
} as const;
