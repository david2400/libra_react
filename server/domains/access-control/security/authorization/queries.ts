import 'server-only';
import { cache } from 'react';

import { 
  authorizationRepository, 
  authorizationStatsRepository,
  authorizationAuditRepository,
  authorizationCacheRepository,
  authorizationPolicyRepository,
  authorizationPerformanceRepository,
  authorizationSecurityRepository,
  authorizationConfigRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type {
  IAuthorizationRequest,
  IAuthorizationResponse,
  IAuthorizationStats,
  IAuthorizationContext,
  IAuthorizationCacheEntry,
  ICacheManagementRequest,
  ICacheManagementResponse,
  IAuthorizationPolicy,
  IAuthorizationAudit,
  IAuditFilter,
  IAuditExportRequest,
  IAuditExportResponse,
  IPerformanceMetrics,
  IResourcePerformance,
  IUserPerformance,
  ISecurityAlert,
  ISecurityRule,
  IConfigUpdateRequest
} from './types';
import type { IUser } from '../../account/users';
import type { IPermission } from '../permissions';
import type { IRole } from '../roles';

// --- Authorization Core Queries -----------------------------------------

export const checkAuthorization = (request: IAuthorizationRequest) => 
  authorizationRepository.check(request);

export const checkAuthorizationWithContext = (request: IAuthorizationRequest, context: IAuthorizationContext) => 
  authorizationRepository.checkWithContext(request, context);

export const batchCheckAuthorization = (requests: IAuthorizationRequest[]) => 
  authorizationRepository.batchCheck(requests);

// --- Authorization Statistics Queries ---------------------------------

export const getAuthorizationStats = cache((params?: { startDate?: string; endDate?: string }) => 
  authorizationStatsRepository.getStats(params)
);

export const getUserAuthorizationStats = cache((userId: string | number, params?: { startDate?: string; endDate?: string }) => 
  authorizationStatsRepository.getUserStats(userId, params)
);

export const getAllUserAuthorizationStats = cache((params?: ListParams) => 
  authorizationStatsRepository.getAllUserStats(params)
);

// --- Authorization Audit Queries ---------------------------------

export const getAuthorizationAudit = cache((params?: ListParams) => 
  authorizationAuditRepository.list(params)
);

export const getAuthorizationAuditById = cache((id: string) => 
  authorizationAuditRepository.getById(id)
);

export const getAuthorizationAuditByUser = cache((userId: string | number, params?: ListParams) => 
  authorizationAuditRepository.getByUser(userId, params)
);

// --- Authorization Cache Queries ---------------------------------

export const getAuthorizationCache = cache((params?: ListParams) => 
  authorizationCacheRepository.list(params)
);

export const getAuthorizationCacheByKey = cache((key: string) => 
  authorizationCacheRepository.getByKey(key)
);

export const getAuthorizationCacheByUser = cache((userId: string | number, params?: ListParams) => 
  authorizationCacheRepository.getByUser(userId, params)
);

// --- Authorization Policy Queries ---------------------------------

export const getAuthorizationPolicies = cache((params?: ListParams) => 
  authorizationPolicyRepository.list(params)
);

export const getAuthorizationPolicyById = cache((id: string) => 
  authorizationPolicyRepository.getById(id)
);

// --- Authorization Performance Queries ---------------------------------

export const getAuthorizationPerformanceMetrics = cache((params?: { startDate?: string; endDate?: string }) => 
  authorizationPerformanceRepository.getMetrics(params)
);

export const getAuthorizationResourcePerformance = cache((params?: ListParams) => 
  authorizationPerformanceRepository.getResourcePerformance(params)
);

export const getAuthorizationUserPerformance = cache((params?: ListParams) => 
  authorizationPerformanceRepository.getUserPerformance(params)
);

// --- Authorization Security Queries ---------------------------------

export const getAuthorizationSecurityAlerts = cache((params?: ListParams) => 
  authorizationSecurityRepository.list(params)
);

export const getAuthorizationSecurityAlertById = cache((id: string) => 
  authorizationSecurityRepository.getById(id)
);

export const getAuthorizationSecurityRules = cache((params?: ListParams) => 
  authorizationSecurityRepository.listRules(params)
);

// --- Authorization Configuration Queries -----------------------------

export const getAuthorizationConfig = cache(() => 
  authorizationConfigRepository.get()
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get comprehensive authorization dashboard
export const getAuthorizationDashboard = cache(async (params?: { startDate?: string; endDate?: string }) => {
  const [stats, recentAudits, securityAlerts, performanceMetrics, config] = await Promise.all([
    getAuthorizationStats(params),
    getAuthorizationAudit({ per_page: 10 }),
    getAuthorizationSecurityAlerts({ per_page: 10 }),
    getAuthorizationPerformanceMetrics(params),
    getAuthorizationConfig()
  ]);
  
  return {
    stats,
    recent_audits: recentAudits.content,
    security_alerts: securityAlerts.content,
    performance_metrics: performanceMetrics,
    config,
    health_score: calculate_health_score(stats, performanceMetrics, securityAlerts.content)
  };
});

// Get user authorization overview
export const getUserAuthorizationOverview = cache(async (userId: string | number, params?: { startDate?: string; endDate?: string }) => {
  const [userStats, recentAudits, userPerformance, userCache] = await Promise.all([
    getUserAuthorizationStats(userId, params),
    getAuthorizationAuditByUser(userId, { per_page: 10 }),
    getAuthorizationUserPerformance({ params: { userId: userId } }),
    getAuthorizationCacheByUser(userId, { per_page: 20 })
  ]);
  
  return {
    user_id: userId,
    stats: userStats,
    recent_audits: recentAudits.content,
    performance: userPerformance.content[0] || null,
    cache_entries: userCache.content,
    cache_hit_rate: userStats.total_checks > 0 ? (userCache.content.reduce((sum: number, entry: any) => sum + entry.access_count, 0) / userStats.total_checks) : 0
  };
});

// Get resource authorization analysis
export const getResourceAuthorizationAnalysis = cache(async (resource: string, params?: { startDate?: string; endDate?: string }) => {
  const [resourcePerformance, relatedAudits] = await Promise.all([
    getAuthorizationResourcePerformance({ params: { resource } }),
    getAuthorizationAudit({ params: { resource, ...params } })
  ]);
  
  const resourceData = resourcePerformance.content.find((rp: any) => rp.resource === resource);
  
  return {
    resource,
    performance: resourceData || null,
    total_requests: relatedAudits.total_elements,
    authorized_requests: relatedAudits.content.filter((a: any) => a.authorized).length,
    unauthorized_requests: relatedAudits.content.filter((a: any) => !a.authorized).length,
    authorization_rate: relatedAudits.total_elements > 0 ? (relatedAudits.content.filter((a: any) => a.authorized).length / relatedAudits.total_elements) * 100 : 0,
    most_common_actions: relatedAudits.content.reduce((acc: any, audit: any) => {
      if (!acc[audit.action]) {
        acc[audit.action] = { count: 0, authorized: 0 };
      }
      acc[audit.action].count++;
      if (audit.authorized) acc[audit.action].authorized++;
      return acc;
    }, {} as Record<string, { count: number; authorized: number }>)
  };
});

// Get authorization security overview
export const getAuthorizationSecurityOverview = cache(async () => {
  const [securityAlerts, securityRules, recentAudits] = await Promise.all([
    getAuthorizationSecurityAlerts({ per_page: 100 }),
    getAuthorizationSecurityRules({ per_page: 100 }),
    getAuthorizationAudit({ per_page: 50 })
  ]);
  
  const alertsBySeverity = securityAlerts.content.reduce((acc: any, alert: any) => {
    if (!acc[alert.severity]) {
      acc[alert.severity] = 0;
    }
    acc[alert.severity]++;
    return acc;
  }, {} as Record<string, number>);
  
  const unresolvedAlerts = securityAlerts.content.filter((alert: any) => !alert.resolved_at);
  
  return {
    total_alerts: securityAlerts.content.length,
    unresolved_alerts: unresolvedAlerts.length,
    alerts_by_severity: alertsBySeverity,
    active_rules: securityRules.content.filter((rule: any) => rule.isActive).length,
    recent_suspicious_activity: recentAudits.content.filter((audit: any) => 
      audit.response_time_ms > 1000 || !audit.authorized
    ).length,
    security_score: calculate_security_score(unresolvedAlerts, alertsBySeverity)
  };
});

// Get authorization performance analysis
export const getAuthorizationPerformanceAnalysis = cache(async (params?: { startDate?: string; endDate?: string }) => {
  const [performanceMetrics, resourcePerformance, userPerformance] = await Promise.all([
    getAuthorizationPerformanceMetrics(params),
    getAuthorizationResourcePerformance({ per_page: 100 }),
    getAuthorizationUserPerformance({ per_page: 100 })
  ]);
  
  // Analyze slow requests
  const slowResources = resourcePerformance.content.filter((rp: any) => rp.average_response_time > 500);
  const slowUsers = userPerformance.content.filter((up: any) => up.average_response_time > 500);
  
  // Calculate percentiles
  const allResponseTimes = [
    ...resourcePerformance.content.map((rp: any) => rp.average_response_time),
    ...userPerformance.content.map((up: any) => up.average_response_time)
  ];
  
  const sortedTimes = allResponseTimes.sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
  
  return {
    metrics: performanceMetrics,
    slow_resources: slowResources,
    slow_users: slowUsers,
    percentiles: {
      p50,
      p95,
      p99
    },
    performance_score: calculate_performance_score(performanceMetrics)
  };
});

// Get authorization cache analysis
export const getAuthorizationCacheAnalysis = cache(async () => {
  const [cacheEntries, config] = await Promise.all([
    getAuthorizationCache({ per_page: 1000 }),
    getAuthorizationConfig()
  ]);
  
  // Analyze cache efficiency
  const totalAccess = cacheEntries.content.reduce((sum: number, entry: any) => sum + entry.access_count, 0);
  const expiredEntries = cacheEntries.content.filter((entry: any) => new Date(entry.expires_at) < new Date());
  const hotEntries = cacheEntries.content.filter((entry: any) => entry.access_count > 10);
  
  // Cache size estimation
  const estimatedSize = JSON.stringify(cacheEntries.content).length / (1024 * 1024); // MB
  
  return {
    total_entries: cacheEntries.content.length,
    total_access_count: totalAccess,
    expired_entries: expiredEntries.length,
    hot_entries: hotEntries.length,
    estimated_size_mb: estimatedSize,
    cache_enabled: config.cache_enabled,
    cache_ttl_seconds: config.cache_ttl_seconds,
    efficiency_score: calculate_cache_efficiency(cacheEntries.content, totalAccess)
  };
});

// Helper functions
function calculate_health_score(stats: IAuthorizationStats, performance: IPerformanceMetrics, alerts: ISecurityAlert[]): number {
  let score = 100;
  
  // Deduct for high unauthorized rate
  if (stats.total_checks > 0) {
    const unauthorizedRate = (stats.unauthorized_checks / stats.total_checks) * 100;
    if (unauthorizedRate > 20) score -= 30;
    else if (unauthorizedRate > 10) score -= 15;
    else if (unauthorizedRate > 5) score -= 5;
  }
  
  // Deduct for slow response time
  if (performance.average_response_time > 1000) score -= 25;
  else if (performance.average_response_time > 500) score -= 10;
  else if (performance.average_response_time > 200) score -= 5;
  
  // Deduct for low cache hit rate
  if (performance.cache_hit_rate < 50) score -= 15;
  else if (performance.cache_hit_rate < 70) score -= 5;
  
  // Deduct for security alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highAlerts = alerts.filter(a => a.severity === 'high').length;
  
  if (criticalAlerts > 0) score -= 40;
  else if (highAlerts > 0) score -= 20;
  else if (alerts.length > 5) score -= 10;
  
  return Math.max(0, score);
}

function calculate_security_score(alerts: ISecurityAlert[], severityBreakdown: Record<string, number>): number {
  let score = 100;
  
  // Deduct based on unresolved alerts
  score -= alerts.length * 5;
  
  // Deduct based on severity
  score -= (severityBreakdown.critical || 0) * 30;
  score -= (severityBreakdown.high || 0) * 15;
  score -= (severityBreakdown.medium || 0) * 5;
  
  return Math.max(0, score);
}

function calculate_performance_score(metrics: IPerformanceMetrics): number {
  let score = 100;
  
  // Response time scoring
  if (metrics.average_response_time > 1000) score -= 40;
  else if (metrics.average_response_time > 500) score -= 20;
  else if (metrics.average_response_time > 200) score -= 10;
  else if (metrics.average_response_time > 100) score -= 5;
  
  // Cache hit rate scoring
  if (metrics.cache_hit_rate < 50) score -= 30;
  else if (metrics.cache_hit_rate < 70) score -= 15;
  else if (metrics.cache_hit_rate < 85) score -= 5;
  
  // Error rate scoring
  if (metrics.error_rate > 5) score -= 30;
  else if (metrics.error_rate > 2) score -= 15;
  else if (metrics.error_rate > 1) score -= 5;
  
  return Math.max(0, score);
}

function calculate_cache_efficiency(entries: IAuthorizationCacheEntry[], totalAccess: number): number {
  if (entries.length === 0 || totalAccess === 0) return 0;
  
  const averageAccessPerEntry = totalAccess / entries.length;
  
  // Score based on average access count
  if (averageAccessPerEntry > 20) return 100;
  if (averageAccessPerEntry > 10) return 80;
  if (averageAccessPerEntry > 5) return 60;
  if (averageAccessPerEntry > 2) return 40;
  return 20;
}
