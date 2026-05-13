import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IPermission } from '../permissions';
import { IPolicy } from '../policies';

// --- Authorization Types ---------------------------------------------------------

export interface IAuthorizationRequest {
  user_id: string | number;
  resource: string;
  action: string;
  context?: Record<string, unknown>;
  request_time?: string;
}

export interface IAuthorizationResponse {
  authorized: boolean;
  reason?: string;
  policies_applied?: string[];
  permissions_used?: string[];
  cache_hit?: boolean;
  response_time?: number;
}

export interface IAuthorizationLog {
  userId: string | number;
  resource: string;
  action: string;
  authorized: boolean;
  reason?: string;
  checked_at: string;
  response_time_ms?: number;
}

// --- IUser Types (for authorization management) ---------------------------------

export interface IUser {
  id: string | number;
  email: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  roles?: any[];
  permissions?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface IPolicyRule {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
  effect?: 'allow' | 'deny';
}

// --- Authorization Context Types ----------------------------------------------

export interface IAuthorizationContext {
  user_id: string | number;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface IAuthorizationDecision {
  request: IAuthorizationRequest;
  response: IAuthorizationResponse;
  context: IAuthorizationContext;
  evaluated_policies: IPolicy[];
  evaluated_permissions: IPermission[];
}

// --- Bulk Authorization Types -------------------------------------------------

export interface IBulkAuthorizationRequest {
  user_id: string | number;
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
  user_id: string | number;
  resource: string;
  action: string;
  authorized: boolean;
  reason?: string;
  context?: IAuthorizationContext;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface IAuthorizationAuditFilter {
  user_id?: string | number;
  resource?: string;
  action?: string;
  authorized?: boolean;
  start_date?: string;
  end_date?: string;
}

// --- Authorization Statistics Types -------------------------------------------

export interface IAuthorizationStats {
  total_requests: number;
  authorized_requests: number;
  denied_requests: number;
  average_response_time: number;
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
