/** Server-only environment helpers – never import from client code. */

let hasWarnedMissingApiBaseUrl = false;

export const env = {
  /** Internal API base URL (server → backend, not exposed to the browser). */
  get apiBaseUrl(): string {
    const candidates = [
      process.env.LIBRA_API_BASE_URL,
      process.env.API_BASE_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL,
      process.env.NEXT_PUBLIC_API_URL,
      process.env.API_DEV_BASE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ];

    const resolvedCandidate = candidates.find(
      (candidate): candidate is string => Boolean(candidate),
    );

    const devFallback =
      process.env.NODE_ENV !== 'production'
        ? `http://localhost:${process.env.DEV_API_PORT ?? 3001}`
        : undefined;

    const url = resolvedCandidate ?? devFallback ?? '';

    if (!resolvedCandidate && devFallback && !hasWarnedMissingApiBaseUrl) {
      console.warn(
        `⚠️  [env] LIBRA_API_BASE_URL is not configured. Defaulting to ${devFallback}. ` +
          'Set LIBRA_API_BASE_URL (or API_BASE_URL) to silence this warning.',
      );
      hasWarnedMissingApiBaseUrl = true;
    }

    if (!url) {
      throw new Error(
        '[env] LIBRA_API_BASE_URL is not configured. Set it in your .env file.',
      );
    }

    return url.replace(/\/+$/, '');
  },

  get isDev(): boolean {
    return process.env.NODE_ENV === 'development';
  },

  get isProd(): boolean {
    return process.env.NODE_ENV === 'production';
  },
} as const;
