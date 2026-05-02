/**
 * Server-side data access layer for Libra Access Control API.
 *
 * Import from domain-specific modules for tree-shaking:
 *
 *   import { getUsers, createUserAction } from '@/server/domains/access-control';
 *   import { getRoles, createRoleAction } from '@/server/domains/access-control';
 *
 * Or import shared utilities:
 *
 *   import { serverFetch, ServerApiError } from '@/server/lib';
 */

export { serverFetch } from './lib/server-fetch';
export { env } from './lib/env';
export type { ListParams, IPaginatedResponse, PaginationMeta, ServerFetchOptions, ActionResultType } from './lib/types';
export { ServerApiError } from './lib/types';
export * from './lib/cache-tags';

// Domain exports
export * from './domains/access-control';
