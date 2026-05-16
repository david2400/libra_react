import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';

// --- Policy Types -------------------------------------------------------------

export enum PolicyEffect {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface IPolicy extends IAuditInfo {
  id_policy: number;
  name: string;
  description?: string;
  application_id: number;
  application?: IApplication;
  version: string;
  default_effect: PolicyEffect;
  is_active: boolean;
  priority: number;
  statements?: IPolicyStatement[];
}

export interface IPolicyStatement {
  id?: number;
  policy_id: number;
  effect: PolicyEffect;
  resource?: string;
  actions?: string[];
  conditions?: Record<string, unknown>;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ICreatePolicyPayload {
  name: string;
  description?: string;
  application_id: number;
  version: string;
  default_effect: PolicyEffect;
  is_active: boolean;
  priority: number;
  statements?: IPolicyStatement[];
}

export interface IUpdatePolicyPayload {
  name?: string;
  description?: string;
  application_id?: number;
  version?: string;
  default_effect?: PolicyEffect;
  is_active?: boolean;
  priority?: number;
  statements?: IPolicyStatement[];
}

// Legacy interface - use IPolicyStatement instead
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
  user_id: number;
  policy_id: number;
  is_active?: boolean;
  user?: IUser;
  policy?: IPolicy;
  // Audit fields
  created_at?: string;
  updated_at?: string;
}

export interface ICreateUserPolicyPayload {
  user_id: number;
  policy_id: number;
  is_active?: boolean;
}

export interface IUpdateUserPolicyPayload {
  is_active?: boolean;
}

// --- Policy Evaluation Types ---------------------------------------------------

export interface IPolicyEvaluationRequest {
  user_id: number;
  resource: string;
  action: string;
  context?: Record<string, unknown>;
}

export interface IPolicyEvaluationResponse {
  allowed: boolean;
  policy_id?: number;
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
