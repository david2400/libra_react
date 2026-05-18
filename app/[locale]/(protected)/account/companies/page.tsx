/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CompanyManager } from "@/modules/account/companies/components/company-manager";

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

const CompaniesPage = () => {
  // Pass empty initial data - the component will fetch data client-side
  return <CompanyManager initialData={[]} />;
};

export default CompaniesPage;
