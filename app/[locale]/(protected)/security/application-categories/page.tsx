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
import { ApplicationCategoryManager } from "@/modules/security/applications-category/components/application-category-manager";
import { getApplicationCategories, IApplicationCategory } from "@/server/domains/access-control/security/application_categories";

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

const ApplicationCategoryManagerPage: NextPage = async () => {
  try {
    const applicationCategoriesResponse = await getApplicationCategories();

    // Extract the data array from the paginated response
    const applicationCategoriesData: IApplicationCategory[] = Array.isArray(applicationCategoriesResponse)
      ? applicationCategoriesResponse
      : applicationCategoriesResponse || [];

    return (
      <ApplicationCategoryManager
        initialData={applicationCategoriesData}
      />
    );
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <ApplicationCategoryManager initialData={[]} />;
  }
};

export default ApplicationCategoryManagerPage;
