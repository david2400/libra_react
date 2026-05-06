import "server-only";

import { modulesApplicationsApi } from "@/lib/api";
import type { IModuleApplication } from "@/server/domains/access-control/security/modules_applications";

export const buildModuleApplicationsData = async (): Promise<IModuleApplication[]> => {
  const moduleApplicationsResponse = await modulesApplicationsApi.list({ per_page: 200 });
  const moduleApplications = (moduleApplicationsResponse as any)?.data ?? [];

  return moduleApplications;
};
