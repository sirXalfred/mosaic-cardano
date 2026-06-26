import { triggerLogout } from "@/lib/logout-handler";

interface FetchAPIOptions {
  method?: string;
  data?: unknown;
  credentials?: boolean; // If true, include credentials (cookies) in the request
  headers?: Record<string, string>;
}

// central api for making api calls
export const fetchAPI = async (url: string, options: FetchAPIOptions = {}): Promise<unknown> => {
  const { method = 'GET', data, headers = {}, credentials = true } = options;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const targetUrl = url.startsWith('http') ? url : `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

  // Attach token from localStorage if present and not already provided
  const updatedHeaders = { ...headers };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      const hasAuthHeader = Object.keys(updatedHeaders).some(
        key => key.toLowerCase() === 'authorization'
      );
      if (!hasAuthHeader) {
        updatedHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  // Set Content-Type automatically if we are sending JSON data and it is not specified
  if (data && typeof data === 'object' && !(data instanceof FormData)) {
    const hasContentType = Object.keys(updatedHeaders).some(
      key => key.toLowerCase() === 'content-type'
    );
    if (!hasContentType) {
      updatedHeaders['Content-Type'] = 'application/json';
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: updatedHeaders,
  };

  if (data) {
    fetchOptions.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  if (credentials) {
    fetchOptions.credentials = 'include';
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok) {
      if (response.status === 401){
        triggerLogout();
      }

      let errorMessage = `API error: ${response.status}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // If both fail, use the original status message
        }
      }
      
      throw new Error(errorMessage);
    }

    // Try parsing as JSON; if empty or not JSON, return response text or null
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    return text ? text : null;

  } catch (error) {
    console.error('Error fetching API:', error);
    throw error;
  }
}
