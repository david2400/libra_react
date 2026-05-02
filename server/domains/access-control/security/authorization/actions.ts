'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  authorizationRepository, 
  authorization_stats_repository,
  authorization_audit_repository,
  authorization_cache_repository,
  authorization_policy_repository,
  authorization_performance_repository,
  authorization_security_repository,
  authorization_config_repository
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

export const check_authorization_action = async (request: IAuthorizationRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationRepository.check(request);
    
    // Create audit entry
    await authorization_audit_repository.create({
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

export const check_authorization_with_context_action = async (request: AuthorizationRequest, context: AuthorizationContext): Promise<ActionResultType<any>> => {
  try {
    const response = await authorizationRepository.check_with_context(request, context);
    
    // Create audit entry with enhanced context
    await authorization_audit_repository.create({
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

export const batch_check_authorization_action = async (requests: IAuthorizationRequest[]): Promise<ActionResultType<any>> => {
  try {
    const responses = await authorizationRepository.batch_check(requests);
    
    // Create audit entries for each request
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const response = responses[i];
      
      await authorization_audit_repository.create({
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

export const manage_authorization_cache_action = async (request: ICacheManagementRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorization_cache_repository.manage(request);
    
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

export const clear_expired_cache_action = async (): Promise<ActionResultType<any>> => {
  try {
    const response = await authorization_cache_repository.clear_expired();
    
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

export const create_authorization_policy_action = async (policy: Omit<IAuthorizationPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdPolicy = await authorization_policy_repository.create(policy);
    
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

export const update_authorization_policy_action = async (id: string, policy: Partial<IAuthorizationPolicy>): Promise<ActionResultType<any>> => {
  try {
    const updatedPolicy = await authorization_policy_repository.update(id, policy);
    
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

export const delete_authorization_policy_action = async (id: string): Promise<ActionResultType<void>> => {
  try {
    await authorization_policy_repository.delete(id);
    
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

export const create_security_alert_action = async (alert: Omit<ISecurityAlert, 'id' | 'detected_at'>): Promise<ActionResultType<any>> => {
  try {
    const createdAlert = await authorization_security_repository.create(alert);
    
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

export const resolve_security_alert_action = async (id: string, resolvedBy: string | number): Promise<ActionResultType<any>> => {
  try {
    const resolvedAlert = await authorization_security_repository.resolve(id, resolvedBy);
    
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
    const createdRule = await authorization_security_repository.create_rule(rule);
    
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
    const updatedRule = await authorization_security_repository.update_rule(id, rule);
    
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
    await authorization_security_repository.delete_rule(id);
    
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

export const update_authorization_config_action = async (config: IConfigUpdateRequest): Promise<ActionResultType<any>> => {
  try {
    const updatedConfig = await authorization_config_repository.update(config);
    
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

export const reset_authorization_config_action = async (): Promise<ActionResultType<any>> => {
  try {
    const resetConfig = await authorization_config_repository.reset();
    
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

export const export_authorization_audit_action = async (request: IAuditExportRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authorization_audit_repository.export(request);
    
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
