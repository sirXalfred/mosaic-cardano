

export const API = {
    AUTH: {
        WHOAMI: '/api/auth/me',
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
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
        LIST: '/api/villages',
    },
} as const;