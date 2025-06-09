
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        
        // Validate URL format
        if (!url || !url.startsWith('/api/')) {
          throw new Error('Invalid API endpoint');
        }

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

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

        return response.json();
      },
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

// Helper function for API requests with explicit methods
export async function apiRequest(url: string, options: RequestInit = {}) {
  const config: RequestInit = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

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
