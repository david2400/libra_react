import "server-only";

import { rolesApi } from "@/lib/api";
import type { IRole } from "@/server/domains/access-control/security/roles";

export const buildRolesData = async (): Promise<IRole[]> => {
  const rolesResponse = await rolesApi.list({ per_page: 200 });
  const roles = (rolesResponse as any)?.data ?? [];

  return roles;
};
