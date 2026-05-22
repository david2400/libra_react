/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";


import { getAllApplicationsServerAction } from "./actions";
import { ApplicationManager } from "@/modules/security/applications/components/application-manager";

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
    const applicationsResponse = await getAllApplicationsServerAction();

    return <ApplicationManager initialData={applicationsResponse} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <ApplicationManager initialData={[]} />;
  }
};

export default ApplicationsPage;
