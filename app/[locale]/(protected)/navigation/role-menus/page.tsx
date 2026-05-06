/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RoleMenuManager } from "@/modules/navigation/role-menus";

import { buildRoleMenusData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("role_menus"),
    description: "Gestión de menús por rol.",
  };
}

const RoleMenusPage = async () => {
  const data = await buildRoleMenusData();

  return <RoleMenuManager initialData={data} />;
};

export default RoleMenusPage;
