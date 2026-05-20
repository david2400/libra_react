/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { PermissionManager } from "@/modules/security/permissions";
import {
  IPermission,
  getPermissions,
} from "@/server/domains/access-control/security/permissions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "security.permissions",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const PermissionsPage: NextPage = async () => {
  try {
    const permissionsResponse = await getPermissions();

    const permissionsData: IPermission[] = Array.isArray(permissionsResponse)
      ? permissionsResponse
      : permissionsResponse?.data || [];

    return <PermissionManager initialData={permissionsData} />;
  } catch (error) {
    // Pass empty initial data - the component will fetch data client-side
    return <PermissionManager initialData={[]} />;
  }
};

export default PermissionsPage;
