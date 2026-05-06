/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PermissionManager } from "@/modules/security/permissions";

import { buildPermissionsData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("permissions"),
    description: "Gestión de permisos del sistema.",
  };
}

const PermissionsPage = async () => {
  const data = await buildPermissionsData();

  return <PermissionManager initialData={data} />;
};

export default PermissionsPage;
