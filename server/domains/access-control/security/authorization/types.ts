import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IPermission } from '../permissions';
import { IPolicy } from '../policies';
import { IUser } from '../../account/users';

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
  policies_applied?: string[];
  permissions_used?: string[];
  context?: IAuthorizationContext;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  response_time_ms?: number;
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
  total_checks: number;
  unauthorized_checks: number;
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

// --- Cache Management Types -------------------------------------------------

export interface ICacheManagementRequest {
  action: 'clear' | 'invalidate' | 'warmup' | 'clear_all_cache' | 'clear_user_cache' | 'clear_expired';
  pattern?: string;
  user_id?: string | number;
}

// --- Audit Export Types -------------------------------------------------------

export interface IAuditExportRequest {
  format: 'json' | 'csv' | 'xlsx';
  filters?: IAuthorizationAuditFilter;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface IAuditExportResponse {
  file_name: string;
  record_count: number;
  format: string;
  generated_at: string;
  download_url?: string;
}

export interface IAuditFilter extends IAuthorizationAuditFilter {
  // Additional filter properties if needed
}

// --- Security Types -----------------------------------------------------------

export interface ISecurityAlert {
  id: string | number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: string;
  resolved_at?: string;
  metadata?: Record<string, unknown>;
}

export interface ISecurityRule {
  id: string;
  name: string;
  description?: string;
  conditions: Record<string, unknown>;
  action: 'allow' | 'deny' | 'alert';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// --- Configuration Types ------------------------------------------------------

export interface IConfigUpdateRequest {
  key: string;
  value: unknown;
}

export interface IAuthorizationConfig {
  cache_enabled: boolean;
  cache_ttl_seconds: number;
  max_cache_size: number;
  audit_enabled: boolean;
  security_enabled: boolean;
}

// --- Additional Types ---------------------------------------------------------

export interface IUserAuthorizationStats {
  user_id: string | number;
  total_requests: number;
  total_checks: number;
  authorized_requests: number;
  denied_requests: number;
  average_response_time: number;
  cache_hit_rate: number;
}

export interface IPolicyEvaluationResult {
  policy_id: string | number;
  policy_name: string;
  effect: 'allow' | 'deny';
  matched_rules: string[];
  evaluation_time_ms: number;
}

// --- Authorization Policy Types -----------------------------------------------

export interface IAuthorizationPolicy {
  id: string | number;
  name: string;
  description?: string;
  rules: IPolicyRule[];
  enabled: boolean;
  priority?: number;
}

// --- Performance Types ---------------------------------------------------------

export interface IPerformanceMetrics {
  total_requests: number;
  average_response_time: number;
  cache_hit_rate: number;
  error_rate: number;
  period: {
    start: string;
    end: string;
  };
}

export interface IResourcePerformance {
  resource: string;
  total_requests: number;
  average_response_time: number;
  error_count: number;
  last_accessed: string;
}

export interface IUserPerformance {
  user_id: string | number;
  total_requests: number;
  average_response_time: number;
  cache_hit_rate: number;
  last_activity: string;
}

// --- Cache Management Response ------------------------------------------------

export interface ICacheManagementResponse {
  cleared_entries: number;
  invalidated_entries: number;
  warmed_entries: number;
  status: string;
}
