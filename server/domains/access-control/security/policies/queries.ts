import 'server-only';
import { cache } from 'react';

import { 
  policiesRepository, 
  userPoliciesRepository,
  policyEvaluationRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IPolicy, 
  IUser,
  IUserPolicy,
  IPolicyEvaluationRequest,
  IPolicyEvaluationResponse,
  IBulkPolicyEvaluationRequest,
  IBulkPolicyEvaluationResponse
} from './types';

// --- Policies Queries ---------------------------------------------------------

export const getPolicies = cache((params?: ListParams) => 
  policiesRepository.list(params)
);

export const getPolicyById = cache((id: string | number) => 
  policiesRepository.getById(id)
);

// --- IUser-Policy Relationships Queries -------------------------------------

export const getUserPolicies = cache((params?: ListParams) => 
  userPoliciesRepository.list(params)
);

export const getUserPolicyById = cache((userId: string | number, policyId: string | number) => 
  userPoliciesRepository.getById(userId, policyId)
);

export const getPoliciesByUser = cache((userId: string | number) => 
  userPoliciesRepository.getPoliciesByUser(userId)
);

export const getUsersByPolicy = cache((policyId: string | number) => 
  userPoliciesRepository.getUsersByPolicy(policyId)
);

// --- Policy Evaluation Queries ---------------------------------------------

export const evaluatePolicy = (payload: IPolicyEvaluationRequest) => 
  policyEvaluationRepository.evaluate(payload);

export const bulkEvaluatePolicies = (payload: IBulkPolicyEvaluationRequest) => 
  policyEvaluationRepository.bulkEvaluate(payload);

export const getActivePoliciesForUser = cache((userId: string | number) => 
  policyEvaluationRepository.getActivePoliciesForUser(userId)
);

export const getEvaluationHistory = cache((userId: string | number, params?: ListParams) => 
  policyEvaluationRepository.getEvaluationHistory(userId, params)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get policy with all user relationships
export const getPolicyProfile = cache(async (policyId: string | number) => {
  const [policy, users] = await Promise.all([
    getPolicyById(policyId),
    getUsersByPolicy(policyId)
  ]);
  
  return {
    policy,
    users
  };
});

// Get user with all active policies
export const getUserPolicyProfile = cache(async (userId: string | number) => {
  const [policies, activePolicies] = await Promise.all([
    getPoliciesByUser(userId),
    getActivePoliciesForUser(userId)
  ]);
  
  return {
    policies,
    active_policies: activePolicies,
    total_policies: policies.length,
    active_count: activePolicies.length
  };
});

// Get policy effectiveness metrics
export const getPolicyMetrics = cache(async (policyId: string | number) => {
  const [policy, users, evaluationHistory] = await Promise.all([
    getPolicyById(policyId),
    getUsersByPolicy(policyId),
    getEvaluationHistory(policyId, { per_page: 100 })
  ]);
  
  // Calculate metrics from evaluation history
  const totalEvaluations = evaluationHistory.meta.total;
  const allowedEvaluations = evaluationHistory.data.filter((evaluation: any) => evaluation.allowed).length;
  const deniedEvaluations = totalEvaluations - allowedEvaluations;
  
  return {
    policy,
    user_count: users.length,
    total_evaluations: totalEvaluations,
    allowed_evaluations: allowedEvaluations,
    denied_evaluations: deniedEvaluations,
    approval_rate: totalEvaluations > 0 ? (allowedEvaluations / totalEvaluations) * 100 : 0
  };
});

// Get comprehensive policy overview
export const getPoliciesOverview = cache(async (params?: ListParams) => {
  const policies = await getPolicies(params);
  
  // Get metrics for each policy (this could be optimized with batch queries)
  const policiesWithMetrics = await Promise.all(
    policies.data.map(async (policy) => {
      const [users] = await Promise.all([
        getUsersByPolicy(policy.id)
      ]);
      
      return {
        ...policy,
        user_count: users.length,
        rule_count: policy.rules?.length || 0
      };
    })
  );
  
  return {
    ...policies,
    data: policiesWithMetrics
  };
});
