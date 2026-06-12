export type ApiError = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

const getBaseUrl = () => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    '';
  return baseUrl;
};

const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof Response) {
    return {
      message: error.statusText || 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.',
      status: error.status,
      details: error,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: error,
    };
  }

  return {
    message: 'Ocurrió un error inesperado. Intenta nuevamente.',
    details: error,
  };
};

export const httpClient = {
  async get<T>(url: string, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return { data };
  },

  async post<T>(url: string, body?: unknown, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return { data };
  },

  async put<T>(url: string, body?: unknown, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return { data };
  },

  async delete<T>(url: string, options?: RequestInit): Promise<{ data: T }> {
    const response = await fetch(`${getBaseUrl()}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return { data };
  },
};

export const withApiError = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    throw normalizeApiError(error);
  }
};
