/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";


import {
  IRole,
  getRoles,
} from "@/server/domains/access-control/security/roles";
import { RoleManager } from "@/modules/security/roles/components/role-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "security.roles" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const RolesPage: NextPage = async () => {
  try {
    const rolesResponse = await getRoles();

    // Extract the data array from the paginated response
    const rolesData: IRole[] = Array.isArray(rolesResponse)
      ? rolesResponse
      : rolesResponse?.content || [];

    return <RoleManager initialData={rolesData} />;
  } catch (error) {
    return <RoleManager initialData={[]} />;
  }
};

export default RolesPage;
