import 'server-only';

import { cookies, headers as nextHeaders } from 'next/headers';
import { env } from './env';
import { ServerApiError, type ServerFetchOptions } from './types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(path, env.apiBaseUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('libra.session-token')?.value ??
      cookieStore.get('next-auth.session-token')?.value ??
      cookieStore.get('__Secure-next-auth.session-token')?.value;

    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Outside of a request context (e.g. build time) – skip auth.
  }
  return {};
}

async function forwardedHeaders(): Promise<Record<string, string>> {
  try {
    const reqHeaders = await nextHeaders();
    const forwarded: Record<string, string> = {};
    const acceptLang = reqHeaders.get('accept-language');
    if (acceptLang) forwarded['Accept-Language'] = acceptLang;
    return forwarded;
  } catch {
    return {};
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => null);
    }

    // Extract the most specific error message from the response body
    const errorMessage = extractErrorMessage(body, response.status);
    
    // Create a properly structured ServerApiError that can be caught
    const serverError = new ServerApiError({
      message: errorMessage,
      status: response.status,
      code: (body as any)?.code,
      details: body,
    });

    // Ensure the error can be properly caught by try-catch
    throw serverError;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Helper function to extract error messages from various response formats
function extractErrorMessage(body: unknown, status: number): string {
  // If body is null or undefined, return status-based message
  if (!body) {
    return `API request failed with status ${status}`;
  }

  // If body is a string, return it directly
  if (typeof body === 'string') {
    return body;
  }

  // If body is an object, try to extract the message from common properties
  if (typeof body === 'object' && body !== null) {
    const bodyObj = body as any;
    
    // Common error message properties in order of preference
    const messageProps = [
      'detail',      // Django/DRF style
      'message',     // Generic REST APIs
      'error',       // Some APIs
      'title',       // Some APIs include title
      'description', // Some APIs include description
      'msg',         // Short form
    ];

    for (const prop of messageProps) {
      if (bodyObj[prop] && typeof bodyObj[prop] === 'string') {
        return bodyObj[prop];
      }
    }

    // If the object has errors array (like validation errors)
    if (Array.isArray(bodyObj.errors) && bodyObj.errors.length > 0) {
      const firstError = bodyObj.errors[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
      if (typeof firstError === 'object' && firstError.message) {
        return firstError.message;
      }
    }

    // If the object has field-specific errors (like validation errors)
    if (bodyObj.errors && typeof bodyObj.errors === 'object') {
      const fieldKeys = Object.keys(bodyObj.errors);
      if (fieldKeys.length > 0) {
        const firstField = fieldKeys[0] as string; // Explicit type assertion
        const fieldErrors = bodyObj.errors[firstField];
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          return fieldErrors[0];
        }
      }
    }
  }

  // Fallback to status-based message
  return `API request failed with status ${status}`;
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────

async function serverRequest<T>(
  method: string,
  path: string,
  opts: ServerFetchOptions & {
    body?: unknown;
    params?: Record<string, unknown>;
  } = {},
): Promise<T> {
  try {
    const { body, params, revalidate, tags, signal, headers: extraHeaders } = opts;

    const [authHeaders, fwdHeaders] = await Promise.all([
      getAuthHeaders(),
      forwardedHeaders(),
    ]);

    const url = buildUrl(path, params);

    const fetchOptions: RequestInit & { next?: Record<string, unknown> } = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
        ...fwdHeaders,
        ...extraHeaders,
      },
      signal,
      next: {},
    };

    // Cache strategy
    if (revalidate !== undefined) {
      fetchOptions.next!.revalidate = revalidate;
    }
    if (tags?.length) {
      fetchOptions.next!.tags = tags;
    }

    // Only attach body for methods that support it
    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(body);
    }

    if (env.isDev) {
      console.log(`[server-fetch] ${method} ${url}`);
    }
    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  } catch (error) {
    console.error(error);
    throw error;
  }

}

// ─── Public API ─────────────────────────────────────────────────────────────

export const serverFetch = {
  get<T>(path: string, opts?: ServerFetchOptions & { params?: Record<string, unknown> }) {
    return serverRequest<T>('GET', path, opts);
  },

  post<T>(path: string, body?: unknown, opts?: ServerFetchOptions) {
    return serverRequest<T>('POST', path, { ...opts, body });
  },

  put<T>(path: string, body?: unknown, opts?: ServerFetchOptions) {
    return serverRequest<T>('PUT', path, { ...opts, body });
  },

  patch<T>(path: string, body?: unknown, opts?: ServerFetchOptions) {
    return serverRequest<T>('PATCH', path, { ...opts, body });
  },

  delete<T>(path: string, opts?: ServerFetchOptions) {
    return serverRequest<T>('DELETE', path, opts);
  },
} as const;
