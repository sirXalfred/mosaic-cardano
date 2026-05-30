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

export const useGetVillageMembership = (communityId: string) => {
  return useXQuery({
    queryKey: ['villageMembership', communityId],
    queryFn: async () => {
      // TODO: Replace with actual API call to check if user is a member of the specific village
      // const res = await fetch(`/api/villages/${communityId}/membership`);
      // return res.json();

      return {
        isMember: false, // Hardcoded to false for now
        role: null,
      };
    }
  });
};


const getAuthState = async () => {
  const res = await fetchAPI(API.AUTH.WHOAMI);
  return AuthStateResponseSchema.parse(res) satisfies AuthStateResponse;
};

const login = async ({email, password}: { email: string; password: string }) => {
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