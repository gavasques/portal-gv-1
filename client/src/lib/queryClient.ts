import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error: any) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Helper function for API requests
export async function apiRequest(method: string, url: string, data?: any) {
  const config: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'Request failed';

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        // If response is not JSON (like HTML error page), use status text
        errorMessage = response.statusText || `HTTP ${response.status}`;
      }
    } catch (parseError) {
      // If we can't parse the response, use status info
      errorMessage = response.statusText || `HTTP ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  return response;
}