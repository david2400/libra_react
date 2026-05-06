import "server-only";

import { companiesApi } from "@/lib/api";
import type { ICompany } from "@/server/domains/access-control/account/companies";

export const buildCompaniesData = async (): Promise<ICompany[]> => {
  const companiesResponse = await companiesApi.list({ per_page: 200 });
  const companies = (companiesResponse as any)?.data ?? [];

  return companies;
};
