

export const API = {
    AUTH: {
        WHOAMI: '/api/auth/me',
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        USERNAME_CHECK: (username: string) => `/api/auth/check-username?username=${username}`,
    },

    HOME: {
        ACTION_ITEMS: '/api/home/action-items',
        ACTIVE_PROJECTS: '/api/home/active-projects',
        COMMUNITY_UPDATES: '/api/home/community-updates',
        SAVED_ITEMS: '/api/home/saved-items',
        PENDING_SIGNATURES: '/api/home/pending-signatures',
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
        POSTS: (communityId: string) => `/api/villages/${communityId}/posts`,
        SETTINGS: (communityId: string) => `/api/villages/${communityId}/settings`,
        ACTIVITY_LOG: (communityId: string) => `/api/villages/${communityId}/activity-log`,
        MY: '/api/villages/me',
        LIST: '/api/villages',
    },
    EXPLORE: {
        LIST: '/api/explore',
    },
    POSTS: {
        DETAILS: (postId: string) => `/api/posts/${postId}`,
        VOTE: (postId: string) => `/api/posts/${postId}/vote`,
        REPLIES: (postId: string) => `/api/posts/${postId}/replies`,
    },
    INVITES: {
        CREATE: '/api/invites',
        ACCEPT: (hash: string) => `/api/invites/${hash}/accept`,
    },
    PAYMENTS: {
        VERIFY: '/api/payments/verify',
    }
} as const;