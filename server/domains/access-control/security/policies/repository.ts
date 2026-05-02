import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IPolicy, 
  ICreatePolicyPayload, 
  IUpdatePolicyPayload,
  IUser,
  IUserPolicy,
  ICreateUserPolicyPayload,
  IUpdateUserPolicyPayload,
  IPolicyEvaluationRequest,
  IPolicyEvaluationResponse,
  IBulkPolicyEvaluationRequest,
  IBulkPolicyEvaluationResponse
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Policies Repository ---------------------------------------------------------

export const policiesRepository = {
  // List policies
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IPolicy>>('/api/access_control/policies', {
      params,
      revalidate: 120,
      tags: [accessControlTags.policies()],
    }),

  // Get policy by ID
  getById: (id: string | number) => 
    serverFetch.get<IPolicy>(`/api/access_control/policies/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.policy(id)],
    }),

  // Create policy
  create: (payload: ICreatePolicyPayload) => 
    serverFetch.post<IPolicy>('/api/access_control/policies', payload, {
      revalidate: false,
    }),

  // Update policy
  update: (id: string | number, payload: IUpdatePolicyPayload) => 
    serverFetch.put<IPolicy>(`/api/access_control/policies/${id}`, payload, {
      revalidate: false,
    }),

  // Delete policy
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/policies/${id}`, {
      revalidate: false,
    }),
} as const;

// --- IUser-IPolicy Relationships Repository -------------------------------------

export const userPoliciesRepository = {
  // List user-policies
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IUserPolicy>>('/api/access_control/user-policies', {
      params,
      revalidate: 120,
      tags: [accessControlTags.userPolicies()],
    }),

  // Get user-policy by IDs
  getById: (userId: string | number, policyId: string | number) => 
    serverFetch.get<IUserPolicy>(`/api/access_control/user-policies/${userId}/${policyId}`, {
      revalidate: 300,
      tags: [accessControlTags.userPolicy(userId, policyId)],
    }),

  // Get policies by user
  getPoliciesByUser: (userId: string | number) => 
    serverFetch.get<IPolicy[]>(`/api/access_control/user-policies/user/${userId}`, {
      revalidate: 120,
      tags: [accessControlTags.user(userId)],
    }),

  // Get users by policy
  getUsersByPolicy: (policyId: string | number) => 
    serverFetch.get<IUser[]>(`/api/access_control/user-policies/policy/${policyId}`, {
      revalidate: 300,
      tags: [accessControlTags.policy(policyId)],
    }),

  // Create user-policy relationship
  create: (userId: string | number, policyId: string | number, payload: ICreateUserPolicyPayload) => 
    serverFetch.post<IUserPolicy>(`/api/access_control/user-policies/${userId}/${policyId}`, payload, {
      revalidate: false,
    }),

  // Update user-policy relationship
  update: (userId: string | number, policyId: string | number, payload: IUpdateUserPolicyPayload) => 
    serverFetch.put<IUserPolicy>(`/api/access_control/user-policies/${userId}/${policyId}`, payload, {
      revalidate: false,
    }),

  // Delete user-policy relationship
  delete: (userId: string | number, policyId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/user-policies/${userId}/${policyId}`, {
      revalidate: false,
    }),
} as const;

// --- IPolicy Evaluation Repository ---------------------------------------------

export const policyEvaluationRepository = {
  // Evaluate single policy
  evaluate: (payload: IPolicyEvaluationRequest) => 
    serverFetch.post<IPolicyEvaluationResponse>('/api/access_control/policies/evaluate', payload, {
      revalidate: false,
    }),

  // Evaluate multiple policies
  bulkEvaluate: (payload: IBulkPolicyEvaluationRequest) => 
    serverFetch.post<IBulkPolicyEvaluationResponse>('/api/access_control/policies/bulk-evaluate', payload, {
      revalidate: false,
    }),

  // Get active policies for user
  getActivePoliciesForUser: (userId: string | number) => 
    serverFetch.get<IPolicy[]>(`/api/access_control/policies/user/${userId}/active`, {
      revalidate: 60,
      tags: [accessControlTags.user(userId)],
    }),

  // Get policy evaluation history
  getEvaluationHistory: (userId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<any>>(`/api/access_control/policies/user/${userId}/history`, {
      params,
      revalidate: 300,
      tags: [accessControlTags.user(userId)],
    }),
} as const;
