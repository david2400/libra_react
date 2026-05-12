/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { MenuManager } from "@/modules/navigation/menus/components/menu-manager";
import { IMenu } from "@/modules/navigation/menus/models/menu.interface";
import { getMenus } from "@/server/domains/access-control/navigation/menus";

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
  try {
    const themesResponse = await getMenus();

    // Extract the data array from the paginated response
    const themesData: IMenu[] = Array.isArray(themesResponse)
      ? themesResponse
      : themesResponse?.data || [];

    return <MenuManager initialData={themesData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <MenuManager initialData={[]} />;
  }
};

export default MenusPage;
