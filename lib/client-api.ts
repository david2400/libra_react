// Client-side API wrapper that uses regular fetch
// This avoids server-only imports like next/headers

export interface ClientFetchOptions {
  revalidate?: number;
  tags?: string[];
  headers?: Record<string, string>;
}

export interface ClientFetchOptionsWithParams extends ClientFetchOptions {
  params?: Record<string, unknown>;
}

// Helper function to build URL with query params
function buildUrl(path: string, params?: Record<string, unknown>): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = new URL(path, baseUrl);
  
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  
  return url.toString();
}

// Helper function to get auth token from cookies (client-side)
function getAuthHeaders(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  
  const cookies = document.cookie.split(';');
  const token = cookies
    .find(cookie => cookie.trim().startsWith('next-auth.session-token=') || 
                     cookie.trim().startsWith('__Secure-next-auth.session-token='))
    ?.split('=')[1];
  
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper function to handle response
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => null);
    }

    const errorMessage = extractErrorMessage(body, response.status);
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Helper function to extract error messages
function extractErrorMessage(body: unknown, status: number): string {
  if (!body) {
    return `API request failed with status ${status}`;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (typeof body === 'object' && body !== null) {
    const bodyObj = body as any;
    const messageProps = ['detail', 'message', 'error', 'title', 'description', 'msg'];

    for (const prop of messageProps) {
      if (bodyObj[prop] && typeof bodyObj[prop] === 'string') {
        return bodyObj[prop];
      }
    }

    if (Array.isArray(bodyObj.errors) && bodyObj.errors.length > 0) {
      const firstError = bodyObj.errors[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
      if (typeof firstError === 'object' && firstError.message) {
        return firstError.message;
      }
    }

    if (bodyObj.errors && typeof bodyObj.errors === 'object') {
      const fieldKeys = Object.keys(bodyObj.errors);
      if (fieldKeys.length > 0) {
        const firstField = fieldKeys[0] as string;
        const fieldErrors = bodyObj.errors[firstField];
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          return fieldErrors[0];
        }
      }
    }
  }

  return `API request failed with status ${status}`;
}

// Core fetch wrapper
async function clientRequest<T>(
  method: string,
  path: string,
  opts: ClientFetchOptionsWithParams & {
    body?: unknown;
  } = {},
): Promise<T> {
  try {
    const { body, params, headers: extraHeaders } = opts;

    const url = buildUrl(path, params);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getAuthHeaders(),
        ...extraHeaders,
      },
    };

    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Public API
export const clientApi = {
  get<T>(path: string, opts?: ClientFetchOptionsWithParams) {
    return clientRequest<T>('GET', path, opts);
  },

  post<T>(path: string, body?: unknown, opts?: ClientFetchOptions) {
    return clientRequest<T>('POST', path, { ...opts, body });
  },

  put<T>(path: string, body?: unknown, opts?: ClientFetchOptions) {
    return clientRequest<T>('PUT', path, { ...opts, body });
  },

  patch<T>(path: string, body?: unknown, opts?: ClientFetchOptions) {
    return clientRequest<T>('PATCH', path, { ...opts, body });
  },

  delete<T>(path: string, opts?: ClientFetchOptions) {
    return clientRequest<T>('DELETE', path, opts);
  },
} as const;
