/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PermissionManager } from "@/modules/security/permissions";
import { IPermission, getPermissions } from "@/server/domains/access-control/security/permissions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "security.permissions" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const PermissionsPage = async () => {
  try {
    const modulesApplicationResponse = await getPermissions();

    // Extract the data array from the paginated response
    const modulesApplicationData: IPermission[] = Array.isArray(
      modulesApplicationResponse,
    )
      ? modulesApplicationResponse
      : modulesApplicationResponse?.data || [];

    return <PermissionManager initialData={modulesApplicationData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <PermissionManager initialData={[]} />;
  }
};

export default PermissionsPage;
