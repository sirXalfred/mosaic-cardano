

export const API = {
    AUTH: {
        WHOAMI: '/api/auth/me',
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
    },

    HOME: {
        ACTION_ITEMS: '/api/home/action-items',
        ACTIVE_PROJECTS: '/api/home/active-projects',
        COMMUNITY_UPDATES: '/api/home/community-updates',
        SAVED_ITEMS: '/api/home/saved-items',
    },

    ONBOARDING: {
        SET_INFO: '/api/onboarding',
        INSIGHTS: '/api/onboarding/insights',
    },

    COMMUNITIES: {
        SEARCH: '/api/communities/search',
    },

    VILLAGE: {
        CREATE: '/api/villages/create',
        JOIN: (communityId: string) => `/api/villages/${communityId}/join`,
        LEAVE: (communityId: string) => `/api/villages/${communityId}/leave`,
        DETAILS: (communityId: string) => `/api/villages/${communityId}`,
        MEMBERS: (communityId: string) => `/api/villages/${communityId}/members`,
        MEMBERSHIP: (communityId: string) => `/api/villages/${communityId}/membership`,
        MY: '/api/villages/me',
        LIST: '/api/villages',
    },
    EXPLORE: {
        LIST: '/api/explore',
    },
} as const;