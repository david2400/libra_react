/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RolePermissionManager } from "@/modules/security/role-permissions";

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

const RolePermissionsPage = () => {
  // Pass empty initial data - the component will fetch data client-side
  return <RolePermissionManager initialData={[]} />;
};

export default RolePermissionsPage;
