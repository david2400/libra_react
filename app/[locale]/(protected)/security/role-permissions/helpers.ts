import "server-only";

import { rolePermissionsApi } from "@/lib/api";
import type { IRolePermission } from "@/server/domains/access-control/security/role_permissions";

export const buildRolePermissionsData = async (): Promise<IRolePermission[]> => {
  const rolePermissionsResponse = await rolePermissionsApi.list({ per_page: 200 });
  const rolePermissions = (rolePermissionsResponse as any)?.data ?? [];

  return rolePermissions;
};
