/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CompanyManager } from "@/modules/account/companies/components/company-manager";

import { buildCompaniesData } from "./helpers";

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
  const data = await buildCompaniesData();

  return <CompanyManager initialData={data} />;
};

export default CompaniesPage;
