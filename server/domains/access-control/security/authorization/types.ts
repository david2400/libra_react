import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Authorization Types ---------------------------------------------------------

export interface IAuthorizationRequest {
  userId: string | number;
  resource: string;
  action: string;
  context?: Record<string, unknown>;
  requestTime?: string;
}

export interface IAuthorizationResponse {
  authorized: boolean;
  reason?: string;
  policiesApplied?: string[];
  permissionsUsed?: string[];
  cacheHit?: boolean;
  responseTime?: number;
}

export interface IAuthorizationLog {
  userId: string | number;
  resource: string;
  action: string;
  authorized: boolean;
  reason?: string;
  checkedAt: string;
  responseTimeMs?: number;
}

// --- IUser Types (for authorization management) ---------------------------------

export interface IUser {
  id: string | number;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roles?: any[];
  permissions?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// --- IPermission Types (for authorization management) -------------------------

export interface IPermission {
  id: string | number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Policy Types (for authorization management) -----------------------------

export interface IPolicy {
  id: string | number;
  name: string;
  description?: string;
  rules?: IPolicyRule[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPolicyRule {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
  effect?: 'allow' | 'deny';
}

// --- Authorization Context Types ----------------------------------------------

export interface IAuthorizationContext {
  userId: string | number;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface IAuthorizationDecision {
  request: IAuthorizationRequest;
  response: IAuthorizationResponse;
  context: IAuthorizationContext;
  evaluatedPolicies: IPolicy[];
  evaluatedPermissions: IPermission[];
}

// --- Bulk Authorization Types -------------------------------------------------

export interface IBulkAuthorizationRequest {
  userId: string | number;
  checks: Array<{
    resource: string;
    action: string;
  }>;
  context?: Record<string, unknown>;
}

export interface IBulkAuthorizationResponse {
  results: Array<{
    resource: string;
    action: string;
    authorized: boolean;
    reason?: string;
  }>;
  summary: {
    total: number;
    authorized: number;
    denied: number;
  };
}

// --- Authorization Cache Types ------------------------------------------------

export interface IAuthorizationCacheEntry {
  userId: string | number;
  resource: string;
  action: string;
  authorized: boolean;
  cachedAt: string;
  expiresAt: string;
  ttl: number;
}

export interface IAuthorizationCacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  lastUpdated: string;
}

// --- Authorization Audit Types ------------------------------------------------

export interface IAuthorizationAudit {
  id: string | number;
  userId: string | number;
  resource: string;
  action: string;
  authorized: boolean;
  reason?: string;
  context?: IAuthorizationContext;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface IAuthorizationAuditFilter {
  userId?: string | number;
  resource?: string;
  action?: string;
  authorized?: boolean;
  startDate?: string;
  endDate?: string;
}

// --- Authorization Statistics Types -------------------------------------------

export interface IAuthorizationStats {
  totalRequests: number;
  authorizedRequests: number;
  deniedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  topResources: Array<{
    resource: string;
    count: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface IAuthorizationOverview {
  user: IUser;
  permissions: IPermission[];
  policies: IPolicy[];
  recentAuthorizations: IAuthorizationLog[];
  stats: IAuthorizationStats;
}
