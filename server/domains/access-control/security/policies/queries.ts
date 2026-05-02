import 'server-only';
import { cache } from 'react';

import { 
  policiesRepository, 
  user_policies_repository,
  policy_evaluation_repository
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

export const get_policies = cache((params?: ListParams) => 
  policiesRepository.list(params)
);

export const get_policy_by_id = cache((id: string | number) => 
  policiesRepository.getById(id)
);

// --- IUser-Policy Relationships Queries -------------------------------------

export const get_user_policies = cache((params?: ListParams) => 
  user_policies_repository.list(params)
);

export const get_user_policy_by_id = cache((userId: string | number, policyId: string | number) => 
  user_policies_repository.getById(userId, policyId)
);

export const get_policies_by_user = cache((userId: string | number) => 
  user_policies_repository.get_policies_by_user(userId)
);

export const get_users_by_policy = cache((policyId: string | number) => 
  user_policies_repository.get_users_by_policy(policyId)
);

// --- Policy Evaluation Queries ---------------------------------------------

export const evaluate_policy = (payload: IPolicyEvaluationRequest) => 
  policy_evaluation_repository.evaluate(payload);

export const bulk_evaluate_policies = (payload: IBulkPolicyEvaluationRequest) => 
  policy_evaluation_repository.bulk_evaluate(payload);

export const get_active_policies_for_user = cache((userId: string | number) => 
  policy_evaluation_repository.get_active_policies_for_user(userId)
);

export const get_evaluation_history = cache((userId: string | number, params?: ListParams) => 
  policy_evaluation_repository.get_evaluation_history(userId, params)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get policy with all user relationships
export const get_policy_profile = cache(async (policyId: string | number) => {
  const [policy, users] = await Promise.all([
    get_policy_by_id(policyId),
    get_users_by_policy(policyId)
  ]);
  
  return {
    policy,
    users
  };
});

// Get user with all active policies
export const get_user_policy_profile = cache(async (userId: string | number) => {
  const [policies, activePolicies] = await Promise.all([
    get_policies_by_user(userId),
    get_active_policies_for_user(userId)
  ]);
  
  return {
    policies,
    active_policies: activePolicies,
    total_policies: policies.length,
    active_count: activePolicies.length
  };
});

// Get policy effectiveness metrics
export const get_policy_metrics = cache(async (policyId: string | number) => {
  const [policy, users, evaluationHistory] = await Promise.all([
    get_policy_by_id(policyId),
    get_users_by_policy(policyId),
    get_evaluation_history(policyId, { per_page: 100 })
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
export const get_policies_overview = cache(async (params?: ListParams) => {
  const policies = await get_policies(params);
  
  // Get metrics for each policy (this could be optimized with batch queries)
  const policiesWithMetrics = await Promise.all(
    policies.data.map(async (policy) => {
      const [users] = await Promise.all([
        get_users_by_policy(policy.id)
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
