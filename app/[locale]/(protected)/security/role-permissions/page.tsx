/** @format */

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
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Role Permissions</h1>
      <p className="text-muted-foreground">This feature is under construction.</p>
    </div>
  );
};

export default RolePermissionsPage;
