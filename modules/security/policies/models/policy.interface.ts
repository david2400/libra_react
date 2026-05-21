import type { policies } from '@/server/domains/access-control/security';

export type IPolicyCreateRequest = policies.ICreatePolicy;
export type IPolicyUpdateRequest = policies.IUpdatePolicy;
export type IPolicy = policies.IPolicy;
export type IPolicyRule = policies.IPolicyRule;
