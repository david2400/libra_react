import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Policy Types -------------------------------------------------------------

export interface IPolicy {
  id: string | number;
  name: string;
  description?: string;
  rules?: IPolicyRule[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreatePolicyPayload {
  name: string;
  description?: string;
  rules?: IPolicyRule[];
}

export interface IUpdatePolicyPayload {
  name?: string;
  description?: string;
  rules?: IPolicyRule[];
  isActive?: boolean;
}

export interface IPolicyRule {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
}

// --- IUser-Policy Relationships Types (for policy management) -----------------

export interface IUser {
  id: string | number;
  email: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  isActive?: boolean;
  roles?: any[];
  permissions?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserPolicy {
  userId: string | number;
  policyId: string | number;
  isActive?: boolean;
  user?: IUser;
  policy?: IPolicy;
}

export interface ICreateUserPolicyPayload {
  userId: string | number;
  policyId: string | number;
  isActive?: boolean;
}

export interface IUpdateUserPolicyPayload {
  isActive?: boolean;
}

// --- Policy Evaluation Types ---------------------------------------------------

export interface IPolicyEvaluationRequest {
  userId: string | number;
  resource: string;
  action: string;
  context?: Record<string, unknown>;
}

export interface IPolicyEvaluationResponse {
  allowed: boolean;
  policyId?: string | number;
  policy_name?: string;
  reasons?: string[];
  conditions_matched?: Record<string, unknown>;
}

export interface IBulkPolicyEvaluationRequest {
  evaluations: IPolicyEvaluationRequest[];
}

export interface IBulkPolicyEvaluationResponse {
  results: IPolicyEvaluationResponse[];
  summary: {
    total: number;
    allowed: number;
    denied: number;
  };
}
