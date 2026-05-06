import "server-only";

import { policiesApi } from "@/lib/api";
import type { IPolicy } from "@/server/domains/access-control/security/policies";

export const buildPoliciesData = async (): Promise<IPolicy[]> => {
  const policiesResponse = await policiesApi.list({ per_page: 200 });
  const policies = (policiesResponse as any)?.data ?? [];

  return policies;
};
