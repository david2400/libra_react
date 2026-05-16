// ─── Generic API response wrappers ──────────────────────────────────────────
export interface IAuditInfo {
  deleted: boolean;
  usr_crea?: string;
  usr_mod?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

export interface IPaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ─── Query params ───────────────────────────────────────────────────────────

export type ListParams = {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  q?: string;
  [key: string]: unknown;
};

// ─── Error types ────────────────────────────────────────────────────────────

export class ServerApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(opts: {
    message: string;
    status: number;
    code?: string;
    details?: unknown;
  }) {
    super(opts.message);
    this.name = 'ServerApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }
}

// ─── Cache tags ─────────────────────────────────────────────────────────────

export type CacheTag = `${string}:${string}` | string;

// ─── Fetch options ──────────────────────────────────────────────────────────

export interface ServerFetchOptions {
  /** Next.js revalidation in seconds. `false` = no cache. */
  revalidate?: number | false;
  /** Next.js cache tags for on-demand revalidation. */
  tags?: CacheTag[];
  /** AbortSignal for request cancellation. */
  signal?: AbortSignal;
  /** Extra headers merged into the request. */
  headers?: Record<string, string>;
}

// ─── Action result types ────────────────────────────────────────────────────

export interface IActionResult<T = void> {
  success: true;
  data: T;
}

export interface IActionError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ActionResultType<T = void> = IActionResult<T> | IActionError;
