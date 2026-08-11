'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

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
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  IAuthorizationRequest, 
  IAuthorizationContext,
  ICacheManagementRequest,
  IAuditExportRequest,
  IAuthorizationPolicy,
  ISecurityAlert,
  ISecurityRule,
  IConfigUpdateRequest
} from './types';

// --- Authorization Core Actions -----------------------------------------

export const checkAuthorizationAction = async (request: IAuthorizationRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationRepository.check(request);
    
    // Create audit entry
    await authorizationAuditRepository.create({
      user_id: request.user_id,
      resource: request.resource,
      action: request.action,
      authorized: response.authorized,
      reason: response.reason,
      policies_applied: response.policies_applied || [],
      permissions_used: response.permissions_used || [],
      timestamp: new Date().toISOString(),
      context: {
        user_id: request.user_id,
        timestamp: new Date().toISOString(),
        metadata: request.context
      },
      response_time_ms: response.response_time
    });
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

export const checkAuthorizationWithContextAction = async (request: IAuthorizationRequest, context: IAuthorizationContext): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationRepository.checkWithContext(request, context);
    
    // Create audit entry with enhanced context
    await authorizationAuditRepository.create({
      user_id: request.user_id,
      resource: request.resource,
      action: request.action,
      authorized: response.authorized,
      reason: response.reason,
      policies_applied: response.policies_applied || [],
      permissions_used: response.permissions_used || [],
      timestamp: new Date().toISOString(),
      context,
      response_time_ms: response.response_time
    });
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

export const batchCheckAuthorizationAction = async (requests: IAuthorizationRequest[]): Promise<ActionResultType<any>> => {
  try {
    const responses = await authorizationRepository.batchCheck(requests);
    
    // Create audit entries for each request
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const response = responses[i];
      
      await authorizationAuditRepository.create({
        user_id: request.user_id,
        resource: request.resource,
        action: request.action,
        authorized: response.authorized,
        reason: response.reason,
        policies_applied: response.policies_applied || [],
        permissions_used: response.permissions_used || [],
        timestamp: new Date().toISOString(),
        context: {
          user_id: request.user_id,
          timestamp: new Date().toISOString(),
          metadata: request.context
        },
        response_time_ms: response.response_time
      });
    }
    
    return { success: true, data: responses };
  } catch (error) {
    throw error;
  }
};

// --- Authorization Cache Management Actions ---------------------------------

export const manageAuthorizationCacheAction = async (request: ICacheManagementRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationCacheRepository.manage(request);
    
    // Revalidate cache tags
    if (request.action === 'clear_all_cache') {
      await revalidateCacheTag(accessControlTags.authSession());
      await revalidateCacheTag(accessControlTags.users());
    } else if (request.action === 'clear_user_cache' && request.user_id) {
      await revalidateCacheTag(accessControlTags.user(request.user_id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

export const clearExpiredCacheAction = async (): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationCacheRepository.clearExpired();
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

// --- Authorization Policy Actions -----------------------------------------

export const createAuthorizationPolicyAction = async (policy: Omit<IAuthorizationPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdPolicy = await authorizationPolicyRepository.create(policy);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: createdPolicy };
  } catch (error) {
    throw error;
  }
};

export const updateAuthorizationPolicyAction = async (id: string, policy: Partial<IAuthorizationPolicy>): Promise<ActionResultType<any>> => {
  try {
    const updatedPolicy = await authorizationPolicyRepository.update(id, policy);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: updatedPolicy };
  } catch (error) {
    throw error;
  }
};

export const deleteAuthorizationPolicyAction = async (id: string): Promise<ActionResultType<void>> => {
  try {
    await authorizationPolicyRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};

// --- Authorization Security Actions ---------------------------------

export const createSecurityAlertAction = async (alert: Omit<ISecurityAlert, 'id' | 'detected_at'>): Promise<ActionResultType<any>> => {
  try {
    const createdAlert = await authorizationSecurityRepository.create(alert);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: createdAlert };
  } catch (error) {
    throw error;
  }
};

export const resolveSecurityAlertAction = async (id: string, resolvedBy: string | number): Promise<ActionResultType<any>> => {
  try {
    const resolvedAlert = await authorizationSecurityRepository.resolve(id, resolvedBy);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: resolvedAlert };
  } catch (error) {
    throw error;
  }
};

export const create_security_rule_action = async (rule: Omit<ISecurityRule, 'id' | 'created_at' | 'updated_at'>): Promise<ActionResultType<any>> => {
  try {
    const createdRule = await authorizationSecurityRepository.createRule(rule);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: createdRule };
  } catch (error) {
    throw error;
  }
};

export const update_security_rule_action = async (id: string, rule: Partial<ISecurityRule>): Promise<ActionResultType<any>> => {
  try {
    const updatedRule = await authorizationSecurityRepository.updateRule(id, rule);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: updatedRule };
  } catch (error) {
    throw error;
  }
};

export const delete_security_rule_action = async (id: string): Promise<ActionResultType<void>> => {
  try {
    await authorizationSecurityRepository.deleteRule(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};

// --- Authorization Configuration Actions -----------------------------

export const updateAuthorizationConfigAction = async (config: IConfigUpdateRequest): Promise<ActionResultType<any>> => {
  try {
    const updatedConfig = await authorizationConfigRepository.update(config);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: updatedConfig };
  } catch (error) {
    throw error;
  }
};

export const resetAuthorizationConfigAction = async (): Promise<ActionResultType<any>> => {
  try {
    const resetConfig = await authorizationConfigRepository.reset();
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: resetConfig };
  } catch (error) {
    throw error;
  }
};

// --- Authorization Audit Export Actions ---------------------------------

export const exportAuthorizationAuditAction = async (request: IAuditExportRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationAuditRepository.export(request);
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};
