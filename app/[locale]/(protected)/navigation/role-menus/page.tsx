/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import {
  IRoleMenu,
  getRoleMenus,
} from "@/server/domains/access-control/navigation/role_menus";
import { RoleMenuManager } from "@/modules/navigation/role-menus/components/role-menu-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "navigation.roleMenus",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const RoleMenusPage: NextPage = async () => {
  try {
    const rolesMenuResponse = await getRoleMenus();

    const roleMenusData: IRoleMenu[] = Array.isArray(rolesMenuResponse)
      ? rolesMenuResponse
      : rolesMenuResponse?.data || [];

    return <RoleMenuManager initialData={roleMenusData} />;
  } catch (error) {
    return <RoleMenuManager initialData={[]} />;
  }
};

export default RoleMenusPage;
