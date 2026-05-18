/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CompanyApplicationManager } from "@/modules/security/company-applications";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "security.companyApplications" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const CompanyApplicationsPage = () => {
  // Pass empty initial data - the component will fetch data client-side
  return <CompanyApplicationManager initialData={[]} />;
};

export default CompanyApplicationsPage;
