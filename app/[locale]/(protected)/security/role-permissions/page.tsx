/** @format */

import { RolePermissionManager } from "@/modules/security/role-permissions/components/role-permission-manager";
import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "security.rolePermissions",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const RolePermissionsPage: NextPage = async () => {
  // const permissionsResponse = await getPermissions();

  // const permissionsData: IPermission[] = Array.isArray(permissionsResponse)
  //   ? permissionsResponse
  //   : permissionsResponse?.content || [];

  return <RolePermissionManager />;

};

export default RolePermissionsPage;
