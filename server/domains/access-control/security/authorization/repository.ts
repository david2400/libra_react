import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IAuthorizationRequest, 
  IAuthorizationResponse,
  IAuthorizationCheck,
  IUser,
  IPermission,
  IRole,
  IAuthorizationStats,
  IUserAuthorizationStats,
  IAuthorizationContext,
  IContextEnrichment,
  IAuthorizationCacheEntry,
  ICacheManagementRequest,
  ICacheManagementResponse,
  IAuthorizationPolicy,
  IPolicyEvaluationResult,
  IAuthorizationAudit,
  IAuditFilter,
  IAuditExportRequest,
  IAuditExportResponse,
  IPerformanceMetrics,
  IResourcePerformance,
  IUserPerformance,
  ISecurityAlert,
  ISecurityRule,
  IAuthorizationConfig,
  IConfigUpdateRequest
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Authorization Core Repository -----------------------------------------

export const authorizationRepository = {
  // Check authorization
  check: (request: IAuthorizationRequest) => 
    serverFetch.post<IAuthorizationResponse>('/api/access_control/authorization/check', request, {
      revalidate: false,
    }),

  // Check authorization with context
  checkWithContext: (request: IAuthorizationRequest, context: IAuthorizationContext) => 
    serverFetch.post<IAuthorizationResponse>('/api/access_control/authorization/check-with-context', { request, context }, {
      revalidate: false,
    }),

  // Batch authorization check
  batch_check: (requests: IAuthorizationRequest[]) => 
    serverFetch.post<IAuthorizationResponse[]>('/api/access_control/authorization/batch-check', { requests }, {
      revalidate: false,
    }),
} as const;

// --- Authorization Statistics Repository ---------------------------------

export const authorization_stats_repository = {
  // Get authorization statistics
  getStats: (params?: { startDate?: string; endDate?: string }) => 
    serverFetch.get<IAuthorizationStats>('/api/access_control/authorization/stats', {
      params,
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),

  // Get user authorization statistics
  getUserStats: (userId: string | number, params?: { startDate?: string; endDate?: string }) => 
    serverFetch.get<IUserAuthorizationStats>(`/api/access_control/authorization/stats/user/${userId}`, {
      params,
      revalidate: 60,
      tags: [accessControlTags.user(userId)],
    }),

  // Get all user statistics
  getAllUserStats: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IUserAuthorizationStats>>('/api/access_control/authorization/stats/users', {
      params,
      revalidate: 60,
      tags: [accessControlTags.users()],
    }),
} as const;

// --- Authorization Audit Repository -------------------------------------

export const authorization_audit_repository = {
  // List audit entries
  list: (params?: ListParams & IAuditFilter) => 
    serverFetch.get<IPaginatedResponse<IAuthorizationAudit>>('/api/access_control/authorization/audit', {
      params,
      revalidate: 120,
      tags: [accessControlTags.authSession()],
    }),

  // Get audit by ID
  getById: (id: string) => 
    serverFetch.get<IAuthorizationAudit>(`/api/access_control/authorization/audit/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.authSession()],
    }),

  // Get audit by user
  get_by_user: (userId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IAuthorizationAudit>>(`/api/access_control/authorization/audit/user/${userId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.user(userId)],
    }),

  // Export audit data
  export: (request: IAuditExportRequest) => 
    serverFetch.post<IAuditExportResponse>('/api/access_control/authorization/audit/export', request, {
      revalidate: false,
    }),

  // Create audit entry (system generated)
  create: (audit: Omit<IAuthorizationAudit, 'id' | 'createdAt'>) => 
    serverFetch.post<IAuthorizationAudit>('/api/access_control/authorization/audit', audit, {
      revalidate: false,
    }),
} as const;

// --- Authorization Cache Repository -------------------------------------

export const authorization_cache_repository = {
  // Get cache entries
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IAuthorizationCacheEntry>>('/api/access_control/authorization/cache', {
      params,
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),

  // Get cache entry by key
  get_by_key: (key: string) => 
    serverFetch.get<IAuthorizationCacheEntry>(`/api/access_control/authorization/cache/${key}`, {
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),

  // Get cache entries by user
  get_by_user: (userId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IAuthorizationCacheEntry>>(`/api/access_control/authorization/cache/user/${userId}`, {
      params,
      revalidate: 60,
      tags: [accessControlTags.user(userId)],
    }),

  // Manage cache
  manage: (request: ICacheManagementRequest) => 
    serverFetch.post<ICacheManagementResponse>('/api/access_control/authorization/cache/manage', request, {
      revalidate: false,
    }),

  // Clear expired entries
  clear_expired: () => 
    serverFetch.post<{ cleared_entries: number }>('/api/access_control/authorization/cache/clear-expired', {}, {
      revalidate: false,
    }),
} as const;

// --- Authorization Policy Repository -------------------------------------

export const authorization_policy_repository = {
  // List policies
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IAuthorizationPolicy>>('/api/access_control/authorization/policies', {
      params,
      revalidate: 300,
      tags: [accessControlTags.authSession()],
    }),

  // Get policy by ID
  getById: (id: string) => 
    serverFetch.get<IAuthorizationPolicy>(`/api/access_control/authorization/policies/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.authSession()],
    }),

  // Create policy
  create: (policy: Omit<IAuthorizationPolicy, 'id' | 'createdAt' | 'updatedAt'>) => 
    serverFetch.post<IAuthorizationPolicy>('/api/access_control/authorization/policies', policy, {
      revalidate: false,
    }),

  // Update policy
  update: (id: string, policy: Partial<IAuthorizationPolicy>) => 
    serverFetch.put<IAuthorizationPolicy>(`/api/access_control/authorization/policies/${id}`, policy, {
      revalidate: false,
    }),

  // Delete policy
  delete: (id: string) => 
    serverFetch.delete<void>(`/api/access_control/authorization/policies/${id}`, {
      revalidate: false,
    }),

  // Evaluate policy
  evaluate: (policyId: string, context: IAuthorizationContext) => 
    serverFetch.post<IPolicyEvaluationResult>(`/api/access_control/authorization/policies/${policyId}/evaluate`, { context }, {
      revalidate: false,
    }),
} as const;

// --- Authorization Performance Repository -----------------------------

export const authorization_performance_repository = {
  // Get performance metrics
  get_metrics: (params?: { startDate?: string; endDate?: string }) => 
    serverFetch.get<IPerformanceMetrics>('/api/access_control/authorization/performance/metrics', {
      params,
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),

  // Get resource performance
  get_resource_performance: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IResourcePerformance>>('/api/access_control/authorization/performance/resources', {
      params,
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),

  // Get user performance
  get_user_performance: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IUserPerformance>>('/api/access_control/authorization/performance/users', {
      params,
      revalidate: 60,
      tags: [accessControlTags.users()],
    }),
} as const;

// --- Authorization Security Repository ---------------------------------

export const authorization_security_repository = {
  // List security alerts
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ISecurityAlert>>('/api/access_control/authorization/security/alerts', {
      params,
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),

  // Get security alert by ID
  getById: (id: string) => 
    serverFetch.get<ISecurityAlert>(`/api/access_control/authorization/security/alerts/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.authSession()],
    }),

  // Create security alert
  create: (alert: Omit<ISecurityAlert, 'id' | 'detected_at'>) => 
    serverFetch.post<ISecurityAlert>('/api/access_control/authorization/security/alerts', alert, {
      revalidate: false,
    }),

  // Resolve security alert
  resolve: (id: string, resolvedBy: string | number) => 
    serverFetch.post<ISecurityAlert>(`/api/access_control/authorization/security/alerts/${id}/resolve`, { resolved_by: resolvedBy }, {
      revalidate: false,
    }),

  // List security rules
  list_rules: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ISecurityRule>>('/api/access_control/authorization/security/rules', {
      params,
      revalidate: 300,
      tags: [accessControlTags.authSession()],
    }),

  // Create security rule
  createRule: (rule: Omit<ISecurityRule, 'id' | 'createdAt' | 'updatedAt'>) => 
    serverFetch.post<ISecurityRule>('/api/access_control/authorization/security/rules', rule, {
      revalidate: false,
    }),

  // Update security rule
  updateRule: (id: string, rule: Partial<ISecurityRule>) => 
    serverFetch.put<ISecurityRule>(`/api/access_control/authorization/security/rules/${id}`, rule, {
      revalidate: false,
    }),

  // Delete security rule
  deleteRule: (id: string) => 
    serverFetch.delete<void>(`/api/access_control/authorization/security/rules/${id}`, {
      revalidate: false,
    }),
} as const;

// --- Authorization Configuration Repository -----------------------------

export const authorizationConfigRepository = {
  // Get configuration
  get: () => 
    serverFetch.get<IAuthorizationConfig>('/api/access_control/authorization/config', {
      revalidate: 300,
      tags: [accessControlTags.authSession()],
    }),

  // Update configuration
  update: (config: IConfigUpdateRequest) => 
    serverFetch.put<IAuthorizationConfig>('/api/access_control/authorization/config', config, {
      revalidate: false,
    }),

  // Reset configuration to defaults
  reset: () => 
    serverFetch.post<IAuthorizationConfig>('/api/access_control/authorization/config/reset', {}, {
      revalidate: false,
    }),
} as const;
