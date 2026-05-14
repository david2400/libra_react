/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RolePermissionManager } from "@/modules/security/role-permissions";
import { IRolePermission, getRolePermissions } from "@/server/domains/access-control/security/role_permissions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "security.rolePermissions" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const RolePermissionsPage = async () => {
  try {
    const rolePermissionResponse = await getRolePermissions();

    // Extract the data array from the paginated response
    const rolePermissionData: IRolePermission[] = Array.isArray(
      rolePermissionResponse,
    )
      ? rolePermissionResponse
      : rolePermissionResponse?.data || [];

    return <RolePermissionManager initialData={rolePermissionData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <RolePermissionManager initialData={[]} />;
  }
};

export default RolePermissionsPage;
