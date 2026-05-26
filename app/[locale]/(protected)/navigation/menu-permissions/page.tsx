/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";
import { MenuPermissionManager } from "@/modules/navigation/menu-permissions/components/menu-permission-manager";
import {
  IMenuPermission,
  getMenuPermissions,
} from "@/server/domains/access-control/navigation/menu_permissions";

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
  try {
    const menuPermissionResponse = await getMenuPermissions();

    // Extract the data array from the paginated response
    const menuPermissions: IMenuPermission[] = Array.isArray(
      menuPermissionResponse,
    )
      ? menuPermissionResponse
      : menuPermissionResponse?.content || [];

    return <MenuPermissionManager initialData={menuPermissions} />;
  } catch (error) {
    return <MenuPermissionManager initialData={[]} />;
  }
};

export default MenuPermissionsPage;
