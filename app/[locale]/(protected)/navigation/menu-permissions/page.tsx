/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MenuPermissionManager } from "@/modules/navigation/menu-permissions/components/menu-permission-manager";

import { buildMenuPermissionsData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("menu_permissions"),
    description: "Gestión de permisos de menú.",
  };
}

const MenuPermissionsPage = async () => {
  const data = await buildMenuPermissionsData();

  return <MenuPermissionManager initialData={data} />;
};

export default MenuPermissionsPage;
