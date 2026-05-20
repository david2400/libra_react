/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { CompanyApplicationManager } from "@/modules/security/company-applications";
import {
  ICompanyApplication,
  getCompanyApplications,
} from "@/server/domains/access-control/security/company_applications";
import { ICompanyApplication as ICompanyApplicationClient } from "@/modules/security/company-applications/models/company-application.interface";

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
    const companyApplicationsData: ICompanyApplicationClient[] = serverApplications.map(app => ({
      id_company_application: app.id_company_application,
      company_id: app.company_id,
      application_id: app.application_id,
      license_start_date: app.license_start_date,
      license_end_date: app.license_end_date,
      is_active: app.is_active,
      user_limit: app.user_limit,
      subscription_type: app.subscription_type,
      auto_renew: app.auto_renew,
      notes: app.notes,
      created_at: app.created_at?.toISOString(),
      updated_at: app.updated_at?.toISOString(),
      // Note: company and application are commented out in server types
      company: undefined,
      application: undefined,
    }));

    // Pass empty initial data - the component will fetch data client-side
    return <CompanyApplicationManager initialData={companyApplicationsData} />;
  } catch (error) {
    return <CompanyApplicationManager initialData={[]} />;
  }
};

export default CompanyApplicationsPage;
