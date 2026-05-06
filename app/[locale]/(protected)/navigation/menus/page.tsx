/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MenuManager } from "@/modules/navigation/menus/components/menu-manager";

import { buildMenusData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("menus"),
    description: "Gestión de menús del sistema.",
  };
}

const MenusPage = async () => {
  const data = await buildMenusData();

  return <MenuManager initialData={data} />;
};

export default MenusPage;
