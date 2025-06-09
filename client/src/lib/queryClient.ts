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
export const apiRequest = async (
  urlOrMethod: string,
  methodOrOptions?: string | RequestInit,
  data?: any
): Promise<any> => {
  let url: string;
  let options: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  // Handle different parameter patterns
  if (typeof methodOrOptions === 'string') {
    // Pattern: apiRequest(url, method, data)
    url = urlOrMethod;
    options.method = methodOrOptions;
    if (data) {
      options.body = JSON.stringify(data);
    }
  } else if (typeof methodOrOptions === 'object') {
    // Pattern: apiRequest(url, options)
    url = urlOrMethod;
    options = { ...options, ...methodOrOptions };
  } else {
    // Pattern: apiRequest(url) - GET request
    url = urlOrMethod;
    options.method = 'GET';
  }

  try {
    const response = await fetch(url, options);

    // Check if response is HTML (common when server errors occur)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Server returned HTML instead of JSON for:', url);
      throw new Error('Server error - received HTML instead of JSON');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const responseText = await response.text();

    if (!responseText) {
      return null;
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('API Request failed:', {
      url,
      method: options.method,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
};