/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ModuleApplicationManager } from "@/modules/security/modules-applications";

import { buildModuleApplicationsData } from "./helpers";

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
  const data = await buildModuleApplicationsData();

  return <ModuleApplicationManager initialData={data} />;
};

export default ModuleApplicationsPage;
