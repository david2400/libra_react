/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";
import {
  IMenuPermission,
  getMenuPermissions,
} from "@/server/domains/access-control/navigation/menu_permissions";
import { MenuPermissionsManager } from "@/modules/navigation/menu-permissions/components/menu-permission-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "navigation.menuPermissions",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const MenuPermissionsPage: NextPage = async () => {
  // const menuPermissionResponse = await getMenuPermissions();

  return <MenuPermissionsManager />;
};

export default MenuPermissionsPage;
