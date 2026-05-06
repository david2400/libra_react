/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RoleManager } from "@/modules/security/roles";

import { buildRolesData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("roles"),
    description: "Gestión de roles del sistema.",
  };
}

const RolesPage = async () => {
  const data = await buildRolesData();

  return <RoleManager initialData={data} />;
};

export default RolesPage;
