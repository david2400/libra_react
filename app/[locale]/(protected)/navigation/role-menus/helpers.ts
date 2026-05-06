import "server-only";

import { roleMenusApi } from "@/lib/api";
import type { IRoleMenu } from "@/server/domains/access-control/navigation/role_menus";

export const buildRoleMenusData = async (): Promise<IRoleMenu[]> => {
  const roleMenusResponse = await roleMenusApi.list({ per_page: 200 });
  const roleMenus = (roleMenusResponse as any)?.data ?? [];

  return roleMenus;
};
