/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { RoleManager } from "@/modules/security/roles";

import {
  IRole,
  getRoles,
} from "@/server/domains/access-control/security/roles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("roles"),
    description: "Gestión de roles del sistema.",
  };
}

const RolesPage: NextPage = async () => {
  try {
    const rolesResponse = await getRoles();

    // Extract the data array from the paginated response
    const rolesData: IRole[] = Array.isArray(rolesResponse)
      ? rolesResponse
      : rolesResponse?.data || [];

    return <RoleManager initialData={rolesData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <RoleManager initialData={[]} />;
  }
};

export default RolesPage;
