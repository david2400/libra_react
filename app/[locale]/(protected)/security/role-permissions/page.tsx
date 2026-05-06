/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RolePermissionManager } from "@/modules/security/role-permissions";

import { buildRolePermissionsData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("role_permissions"),
    description: "Gestión de permisos por rol.",
  };
}

const RolePermissionsPage = async () => {
  const data = await buildRolePermissionsData();

  return <RolePermissionManager initialData={data} />;
};

export default RolePermissionsPage;
