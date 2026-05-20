/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { RolePermissionManager } from "@/modules/security/role-permissions";
import {
  IRolePermission,
  getRolePermissions,
} from "@/server/domains/access-control/security/role_permissions";

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
  try {
    const rolePermissionResponse = await getRolePermissions();

    const rolePermissionData: IRolePermission[] = Array.isArray(
      rolePermissionResponse,
    )
      ? rolePermissionResponse
      : rolePermissionResponse?.data || [];

    return <RolePermissionManager initialData={rolePermissionData} />;
  } catch (error) {
    // Pass empty initial data - the component will fetch data client-side
    return <RolePermissionManager initialData={[]} />;
  }
};

export default RolePermissionsPage;
