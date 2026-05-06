// Client-side fetch utility that doesn't use next/headers
// This is safe to use in client components

import { env } from '@/server/lib/env';

type ClientFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => null);
    }

    const errorMessage = extractErrorMessage(body, response.status);
    
    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.details = body;
    
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function extractErrorMessage(body: unknown, status: number): string {
  if (!body) {
    return `API request failed with status ${status}`;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (typeof body === 'object' && body !== null) {
    const bodyObj = body as any;
    
    const messageProps = [
      'detail',
      'message',
      'error',
      'title',
      'description',
      'msg',
    ];

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
  }

  return `API request failed with status ${status}`;
}

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

export const clientFetch = {
  async get<T>(path: string, options?: Omit<ClientFetchOptions, 'method' | 'body'>) {
    const url = buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: any, options?: Omit<ClientFetchOptions, 'method' | 'body'>) {
    const url = buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body?: any, options?: Omit<ClientFetchOptions, 'method' | 'body'>) {
    const url = buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: any, options?: Omit<ClientFetchOptions, 'method' | 'body'>) {
    const url = buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string, options?: Omit<ClientFetchOptions, 'method' | 'body'>) {
    const url = buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },
} as const;
