import type { 
  ICreatePolicy,
  IUpdatePolicy,
  IPolicy as IPolicyType,
  IPolicyRule as IPolicyRuleType
} from '@/server/domains/access-control/security/policies/types';
import { PolicyEffect } from '@/server/domains/access-control/security/policies/types';

export type IPolicyCreateRequest = ICreatePolicy;
export type IPolicyUpdateRequest = IUpdatePolicy;
export type IPolicy = IPolicyType;
export type IPolicyRule = IPolicyRuleType;
export { PolicyEffect };
