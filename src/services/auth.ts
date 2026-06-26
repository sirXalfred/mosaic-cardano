import { API } from "@/lib/api-routes";
import { useXQuery } from "@/lib/extended-react-query";
import { AuthStateResponseSchema, type AuthStateResponse } from "@/types/api";
import { fetchAPI } from "./api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetAuthState = () => {
  return useXQuery({
    queryKey: ['authState'],
    queryFn: getAuthState
  });
};

export const getWalletNonce = async () => {
  return fetchAPI('/api/auth/wallet/nonce', { method: 'GET' }) as Promise<{ nonce: string }>;
};

export const useGetUserSettings = () => {
  return useXQuery({
    queryKey: ['userSettings'],
    queryFn: async () => fetchAPI('/api/users/me/settings') as Promise<{ email: string | null; walletAddress: string | null; planType: string }>
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authState']
      });
    }
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authState']
      });
    }
  });
}

export const useLoginWithWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { signature: { signature: string; key: string; }; payload: string; address: string }) => {
      const res = await fetchAPI('/api/auth/wallet/login', {
        method: 'POST',
        data: payload
      });
      return AuthStateResponseSchema.parse(res) satisfies AuthStateResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authState']
      });
    }
  });
}

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authState']
      });
    }
  });
}

export const useLinkWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { signature: { signature: string; key: string; }; payload: string; address: string }) => {
      const res = await fetchAPI('/api/auth/wallet/link', {
        method: 'POST',
        data: payload
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    }
  });
}

export const useGetBadges = () => {
  return useXQuery({
    queryKey: ['userBadges'],
    queryFn: async () => fetchAPI('/api/badges') as Promise<{ badges: Array<{ id: string, type: string, status: string, policyId?: string, assetNameBase?: string, txHash?: string }> }>
  });
};

export const useClaimBadge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (badgeId: string) => {
      return fetchAPI('/api/badges', {
        method: 'POST',
        data: { badgeId }
      }) as Promise<{ txHash: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
    }
  });
};

export interface UsernameCheckResult {
  available: boolean;
  error?: Error;
  isLoading: boolean;
  isLoaded: boolean;
}

export const useUsernameCheck = (username: string, enabled: boolean) => {
  const isTooShort = username && username.length < 3;
  const isInvalidFormat = username && !/^[a-zA-Z0-9_]+$/.test(username);
  
  const query = useXQuery({
    queryKey: ['usernameCheck', username],
    queryFn: () => usernameCheck(username),
    enabled: !!(enabled && username && !isTooShort && !isInvalidFormat),
  });

  if (!enabled || !username) {
    return {
      available: true,
      error: undefined,
      isLoading: false,
      isLoaded: true
    }
  }

  if (isTooShort) {
    return {
      available: false,
      error: Error("Username must be at least 3 characters"),
      isLoading: false,
      isLoaded: true
    }
  }
  if (isInvalidFormat) {
    return {
      available: false,
      error: Error("Letters, numbers, and underscores only"),
      isLoading: false,
      isLoaded: true
    }
  }

  return {
    error: query.error,
    isLoaded: query.isLoaded,
    isLoading: query.isLoading,
    available: query.data?.available,
  }
}

const usernameCheck = async (username: string) => {
  const res = await fetchAPI(API.AUTH.USERNAME_CHECK(username))
  return res as { available: boolean };
}

export const useGetVillageMembership = (communityId: string) => {
  return useXQuery({
    queryKey: ['villageMembership', communityId],
    queryFn: async () => fetchAPI(API.VILLAGE.MEMBERSHIP(communityId)) as Promise<{ isMember: boolean; role: string | null }>
  });
};


const getAuthState = async () => {
  const res = await fetchAPI(API.AUTH.WHOAMI);
  return AuthStateResponseSchema.parse(res) satisfies AuthStateResponse;
};

const login = async ({ email, password }: { email: string; password: string }) => {
  const res = await fetchAPI(API.AUTH.LOGIN, {
    method: 'POST',
    data: { email, password },
  });

  return AuthStateResponseSchema.parse(res) satisfies AuthStateResponse;
}


interface registerPayload {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

const register = async (payload: registerPayload) => {
  const res = await fetchAPI(API.AUTH.REGISTER, {
    method: 'POST',
    data: payload,
  });

  return AuthStateResponseSchema.parse(res) satisfies AuthStateResponse;
}

const logout = async () => {
  await fetchAPI(API.AUTH.LOGOUT, {
    method: 'POST',
  });
}