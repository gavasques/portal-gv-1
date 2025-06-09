
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/types";

async function apiRequest(method: string, url: string, data?: any) {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`${response.status}: ${errorData}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Try Replit Auth first, then fallback to legacy auth
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        // Try Replit Auth first
        return await apiRequest('GET', '/api/auth/user');
      } catch (error) {
        // Fallback to legacy auth
        try {
          return await apiRequest('GET', '/api/auth/me');
        } catch (legacyError) {
          return null;
        }
      }
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('GET', '/api/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear();
      // Redirect to login
      window.location.href = '/api/login';
    },
  });

  return {
    user,
    isLoading,
    logout: logoutMutation.mutate,
  };
}
