// Custom API Error class to preserve HTTP status and additional context
export class APIError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

interface FetchAPIOptions {
  url: string;
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
}

// central api for making api calls
export const fetchAPI = async ({ url, method = 'GET', data, headers = {} }: FetchAPIOptions): Promise<unknown> => {
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

  try {
    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      let errorData: unknown = null;

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          if (errorData) {
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (typeof errorData === 'object') {
              const errObj = errorData as Record<string, unknown>;
              if (typeof errObj.error === 'string') {
                errorMessage = errObj.error;
              } else if (errObj.error && typeof errObj.error === 'object') {
                const innerError = errObj.error as Record<string, unknown>;
                if (typeof innerError.message === 'string') {
                  errorMessage = innerError.message;
                }
              } else if (typeof errObj.message === 'string') {
                errorMessage = errObj.message;
              }
            }
          }
        } else {
          const text = await response.text();
          if (text && text.trim().length > 0) {
            errorMessage = text;
          }
        }
      } catch {
        // Fall back to default message if parsing fails
      }

      throw new APIError(errorMessage, response.status, response.statusText, errorData);
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