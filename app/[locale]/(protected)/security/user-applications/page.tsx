/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";
import { UserApplicationsManager } from "@/modules/security/user-application/components/user-application-manager";

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

const UserApplicationPage: NextPage = async () => {
  // const menuPermissionResponse = await getMenuPermissions();

  return <UserApplicationsManager />;
};

export default UserApplicationPage;
