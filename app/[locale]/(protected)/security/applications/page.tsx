/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { ApplicationManager } from "@/modules/security/applications";
import {
  IApplication,
  getApplications,
} from "@/server/domains/access-control/security/applications";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "security.applications",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const ApplicationsPage: NextPage = async () => {
  try {
    const applicationsResponse = await getApplications();

    const applicationData: IApplication[] = Array.isArray(applicationsResponse)
      ? applicationsResponse
      : applicationsResponse?.data || [];

    return <ApplicationManager initialData={applicationData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <ApplicationManager initialData={[]} />;
  }
};

export default ApplicationsPage;
