import axios, {AxiosError, AxiosInstance} from 'axios';

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
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    return {
      message:
        data?.message ??
        axiosError.message ??
        'Ocurrió un error al procesar la solicitud. Intenta nuevamente.',
      status,
      code: data?.code ?? axiosError.code,
      details: data ?? axiosError.toJSON(),
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

export const httpClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl() || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const withApiError = async <T>(promise: Promise<T>): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    throw normalizeApiError(error);
  }
};
