/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ApplicationManager } from "@/modules/security/applications";

import { buildApplicationsData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("applications"),
    description: "Gestión de aplicaciones del sistema.",
  };
}

const ApplicationsPage = async () => {
  const data = await buildApplicationsData();

  return <ApplicationManager initialData={data} />;
};

export default ApplicationsPage;
