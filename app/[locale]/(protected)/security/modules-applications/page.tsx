/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";
import {
  IModuleApplication,
  getModuleApplications,
} from "@/server/domains/access-control/security/modules_applications";
import { ModuleApplicationManager } from "@/modules/security/modules-applications/components/module-application-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "security.modulesApplications",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const ModuleApplicationsPage: NextPage = async () => {
  try {
    const modulesApplicationResponse = await getModuleApplications();

    // Extract the data array from the paginated response
    const modulesApplicationData: IModuleApplication[] = Array.isArray(
      modulesApplicationResponse,
    )
      ? modulesApplicationResponse
      : modulesApplicationResponse?.data || [];

    return <ModuleApplicationManager initialData={modulesApplicationData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <ModuleApplicationManager initialData={[]} />;
  }
};

export default ModuleApplicationsPage;
