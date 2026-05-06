import "server-only";

import { menuPermissionsApi } from "@/lib/api";
import type { IMenuPermission } from "@/server/domains/access-control/navigation/menu_permissions";

export const buildMenuPermissionsData = async (): Promise<IMenuPermission[]> => {
  const menuPermissionsResponse = await menuPermissionsApi.list({ per_page: 200 });
  const menuPermissions = (menuPermissionsResponse as any)?.data ?? [];

  return menuPermissions;
};
