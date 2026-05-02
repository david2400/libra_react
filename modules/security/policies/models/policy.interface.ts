import type { policies } from '@/server/domains/access-control/security';

export type IPolicyCreateRequest = policies.ICreatePolicyPayload;
export type IPolicyUpdateRequest = policies.IUpdatePolicyPayload & { id: string | number };
export type IPolicy = policies.Policy;
export type IPolicyRule = policies.PolicyRule;
