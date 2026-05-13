/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ModuleApplicationManager } from "@/modules/security/modules-applications";
import { IModuleApplication, getModuleApplications } from "@/server/domains/access-control/security/modules_applications";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("module_applications"),
    description: "Gestión de módulos de aplicaciones.",
  };
}

const ModuleApplicationsPage = async () => {
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
