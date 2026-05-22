/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import {
  ICompanyApplication,
  getCompanyApplications,
} from "@/server/domains/access-control/security/company_applications";
import { CompanyApplicationManager } from "@/modules/security/company-applications/components/company-application-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "security.companyApplications",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const CompanyApplicationsPage: NextPage = async () => {
  try {
    const companyApplicationsResponse = await getCompanyApplications();

    // Extract the data array from the paginated response
    const serverApplications: ICompanyApplication[] = Array.isArray(companyApplicationsResponse)
      ? companyApplicationsResponse
      : companyApplicationsResponse?.data || [];

    // Transform server types to client types (convert Date to string)


    // Pass empty initial data - the component will fetch data client-side
    return <CompanyApplicationManager initialData={serverApplications} />;
  } catch (error) {
    return <CompanyApplicationManager initialData={[]} />;
  }
};

export default CompanyApplicationsPage;
