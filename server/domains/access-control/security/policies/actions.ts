'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  policiesRepository, 
  userPoliciesRepository,
  policyEvaluationRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreatePolicyPayload, 
  IUpdatePolicyPayload,
  ICreateUserPolicyPayload,
  IUpdateUserPolicyPayload,
  IPolicyEvaluationRequest,
  IPolicyEvaluationResponse,
  IBulkPolicyEvaluationRequest,
  IBulkPolicyEvaluationResponse
} from './types';

// --- Policies Actions ---------------------------------------------------------

export const createPolicyAction = async (payload: ICreatePolicyPayload): Promise<ActionResultType<any>> => {
  try {
    const policy = await policiesRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.policies());
    if (typeof policy.id === 'string' || typeof policy.id === 'number') {
      await revalidateCacheTag(accessControlTags.policy(policy.id));
    }
    
    return { success: true, data: policy };
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
        message: 'Failed to create policy',
        details: error
      }
    };
  }
};

export const updatePolicyAction = async (id: string | number, payload: IUpdatePolicyPayload): Promise<ActionResultType<any>> => {
  try {
    const policy = await policiesRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.policies());
    await revalidateCacheTag(accessControlTags.policy(id));
    
    return { success: true, data: policy };
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
        message: 'Failed to update policy',
        details: error
      }
    };
  }
};

export const deletePolicyAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await policiesRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.policies());
    await revalidateCacheTag(accessControlTags.policy(id));
    
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
        message: 'Failed to delete policy',
        details: error
      }
    };
  }
};

// --- IUser-Policy Relationships Actions -------------------------------------

export const createUserPolicyAction = async (userId: string | number, policyId: string | number, payload: ICreateUserPolicyPayload): Promise<ActionResultType<any>> => {
  try {
    const userPolicy = await userPoliciesRepository.create(userId, policyId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userPolicies());
    await revalidateCacheTag(accessControlTags.userPolicy(userId, policyId));
    await revalidateCacheTag(accessControlTags.user(userId));
    await revalidateCacheTag(accessControlTags.policy(policyId));
    
    return { success: true, data: userPolicy };
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
        message: 'Failed to create user-policy relationship',
        details: error
      }
    };
  }
};

export const updateUserPolicyAction = async (userId: string | number, policyId: string | number, payload: IUpdateUserPolicyPayload): Promise<ActionResultType<any>> => {
  try {
    const userPolicy = await userPoliciesRepository.update(userId, policyId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userPolicies());
    await revalidateCacheTag(accessControlTags.userPolicy(userId, policyId));
    
    return { success: true, data: userPolicy };
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
        message: 'Failed to update user-policy relationship',
        details: error
      }
    };
  }
};

export const deleteUserPolicyAction = async (userId: string | number, policyId: string | number): Promise<ActionResultType<void>> => {
  try {
    await userPoliciesRepository.delete(userId, policyId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userPolicies());
    await revalidateCacheTag(accessControlTags.userPolicy(userId, policyId));
    
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
        message: 'Failed to delete user-policy relationship',
        details: error
      }
    };
  }
};

// --- Policy Evaluation Actions ---------------------------------------------

export const evaluatePolicyAction = async (payload: IPolicyEvaluationRequest): Promise<ActionResultType<IPolicyEvaluationResponse>> => {
  try {
    const response = await policyEvaluationRepository.evaluate(payload);
    
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
        message: 'Policy evaluation failed',
        details: error
      }
    };
  }
};

export const bulkEvaluatePoliciesAction = async (payload: IBulkPolicyEvaluationRequest): Promise<ActionResultType<IBulkPolicyEvaluationResponse>> => {
  try {
    const response = await policyEvaluationRepository.bulkEvaluate(payload);
    
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
        message: 'Bulk policy evaluation failed',
        details: error
      }
    };
  }
};
