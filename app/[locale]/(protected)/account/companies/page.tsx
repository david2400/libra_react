/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CompanyManager } from "@/modules/account/companies/components/company-manager";
import { ICompany, getCompanies } from "@/server/domains/access-control/account/companies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("companies"),
    description: "Gestión de empresas del sistema.",
  };
}

const CompaniesPage = async () => {
  try {
    const companiesResponse = await getCompanies();

    // Extract the data array from the paginated response
    const companiesData: ICompany[] = Array.isArray(companiesResponse)
      ? companiesResponse
      : companiesResponse?.data || [];

    return <CompanyManager initialData={companiesData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <CompanyManager initialData={[]} />;
  }
};

export default CompaniesPage;
