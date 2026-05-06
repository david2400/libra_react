import "server-only";

import { permissionsApi } from "@/lib/api";
import type { IPermission } from "@/server/domains/access-control/security/permissions";

export const buildPermissionsData = async (): Promise<IPermission[]> => {
  const permissionsResponse = await permissionsApi.list({ per_page: 200 });
  const permissions = (permissionsResponse as any)?.data ?? [];

  return permissions;
};
