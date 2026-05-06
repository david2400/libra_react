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
      userId: request.userId,
      resource: request.resource,
      action: request.action,
      authorized: response.authorized,
      reason: response.reason,
      policies_applied: response.policies_applied || [],
      permissions_used: response.permissions_used || [],
      context: {
        userId: request.userId,
        timestamp: new Date().toISOString(),
        additional_context: request.context
      },
      response_time_ms: response.response_time
    });
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Authorization check failed',
        details: error
      }
    };
  }
};

export const checkAuthorizationWithContextAction = async (request: IAuthorizationRequest, context: IAuthorizationContext): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationRepository.checkWithContext(request, context);
    
    // Create audit entry with enhanced context
    await authorizationAuditRepository.create({
      userId: request.userId,
      resource: request.resource,
      action: request.action,
      authorized: response.authorized,
      reason: response.reason,
      policies_applied: response.policies_applied || [],
      permissions_used: response.permissions_used || [],
      context,
      response_time_ms: response.response_time
    });
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Authorization check with context failed',
        details: error
      }
    };
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
        userId: request.userId,
        resource: request.resource,
        action: request.action,
        authorized: response.authorized,
        reason: response.reason,
        policies_applied: response.policies_applied || [],
        permissions_used: response.permissions_used || [],
        context: {
          userId: request.userId,
          timestamp: new Date().toISOString(),
          additional_context: request.context
        },
        response_time_ms: response.response_time
      });
    }
    
    return { success: true, data: responses };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Batch authorization check failed',
        details: error
      }
    };
  }
};

// --- Authorization Cache Management Actions ---------------------------------

export const manageAuthorizationCacheAction = async (request: ICacheManagementRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationCacheRepository.manage(request);
    
    // Revalidate cache tags
    if (request.clear_all_cache) {
      await revalidateCacheTag(accessControlTags.authSession());
      await revalidateCacheTag(accessControlTags.users());
    } else if (request.clear_user_cache) {
      await revalidateCacheTag(accessControlTags.user(request.clear_user_cache));
    }
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Cache management failed',
        details: error
      }
    };
  }
};

export const clearExpiredCacheAction = async (): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationCacheRepository.clear_expired();
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to clear expired cache entries',
        details: error
      }
    };
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
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to create authorization policy',
        details: error
      }
    };
  }
};

export const updateAuthorizationPolicyAction = async (id: string, policy: Partial<IAuthorizationPolicy>): Promise<ActionResultType<any>> => {
  try {
    const updatedPolicy = await authorizationPolicyRepository.update(id, policy);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: updatedPolicy };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to update authorization policy',
        details: error
      }
    };
  }
};

export const deleteAuthorizationPolicyAction = async (id: string): Promise<ActionResultType<void>> => {
  try {
    await authorizationPolicyRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to delete authorization policy',
        details: error
      }
    };
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
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to create security alert',
        details: error
      }
    };
  }
};

export const resolveSecurityAlertAction = async (id: string, resolvedBy: string | number): Promise<ActionResultType<any>> => {
  try {
    const resolvedAlert = await authorizationSecurityRepository.resolve(id, resolvedBy);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: resolvedAlert };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to resolve security alert',
        details: error
      }
    };
  }
};

export const create_security_rule_action = async (rule: Omit<ISecurityRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdRule = await authorizationSecurityRepository.create_rule(rule);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: createdRule };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to create security rule',
        details: error
      }
    };
  }
};

export const update_security_rule_action = async (id: string, rule: Partial<ISecurityRule>): Promise<ActionResultType<any>> => {
  try {
    const updatedRule = await authorizationSecurityRepository.update_rule(id, rule);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: updatedRule };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to update security rule',
        details: error
      }
    };
  }
};

export const delete_security_rule_action = async (id: string): Promise<ActionResultType<void>> => {
  try {
    await authorizationSecurityRepository.delete_rule(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to delete security rule',
        details: error
      }
    };
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
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to update authorization configuration',
        details: error
      }
    };
  }
};

export const resetAuthorizationConfigAction = async (): Promise<ActionResultType<any>> => {
  try {
    const resetConfig = await authorizationConfigRepository.reset();
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.authSession());
    
    return { success: true, data: resetConfig };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to reset authorization configuration',
        details: error
      }
    };
  }
};

// --- Authorization Audit Export Actions ---------------------------------

export const exportAuthorizationAuditAction = async (request: IAuditExportRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationAuditRepository.export(request);
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to export authorization audit data',
        details: error
      }
    };
  }
};
