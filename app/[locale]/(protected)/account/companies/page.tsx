/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { CompanyManager } from "@/modules/account/companies/components/company-manager";
import {
  ICompany,
  getCompanies,
} from "@/server/domains/access-control/account/companies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "account.companies" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const CompaniesPage: NextPage = async () => {
  try {
    const companiesResponse = await getCompanies();

    const companiesData: ICompany[] = Array.isArray(companiesResponse)
      ? companiesResponse
      : companiesResponse?.data || [];

    return <CompanyManager initialData={companiesData} />;
  } catch (error) {
    return <CompanyManager initialData={[]} />;
  }
  // Pass empty initial data - the component will fetch data client-side
};

export default CompaniesPage;
