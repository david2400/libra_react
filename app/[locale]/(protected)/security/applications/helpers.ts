import "server-only";

import { applicationsApi } from "@/lib/api";
import type { IApplication } from "@/server/domains/access-control/security/applications";

export const buildApplicationsData = async (): Promise<IApplication[]> => {
  const applicationsResponse = await applicationsApi.list({ per_page: 200 });
  const applications = (applicationsResponse as any)?.data ?? [];

  return applications;
};
