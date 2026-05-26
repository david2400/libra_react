/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { MenuManager } from "@/modules/navigation/menus/components/menu-manager";
import { IMenu } from "@/modules/navigation/menus/models/menu.interface";
import { getMenus } from "@/server/domains/access-control/navigation/menus";
import {
  IApplication,
  getApplications,
} from "@/server/domains/access-control/security/applications";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "navigation.menus" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const MenusPage: NextPage = async () => {
  try {
    const menusResponse = await getMenus();
    const applicationResponse = await getApplications();

    // Extract the data array from the paginated response
    const menuData: IMenu[] = Array.isArray(menusResponse)
      ? menusResponse
      : menusResponse?.content || [];

    // Extract the data array from the paginated response
    const applicationData: IApplication[] = Array.isArray(applicationResponse)
      ? applicationResponse
      : applicationResponse?.content || [];

    return (
      <MenuManager
        initialData={menuData}
        initialApplications={applicationData}
      />
    );
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <MenuManager initialData={[]} initialApplications={[]} />;
  }
};

export default MenusPage;
