"use client";

import { useState, useEffect } from "react";

// Client-side hooks that call server actions
export function useApplicationData() {
  const [applications, setApplications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const loadApplications = async () => {
    try {
      setIsLoadingApps(true);
      // Import dynamically to avoid next/headers issues
      const { getApplicationsServerAction } = await import("@/app/[locale]/(protected)/navigation/menu-permissions/actions");
      const apps = await getApplicationsServerAction();
      console.log("Apps received:", apps);

      if (apps && Array.isArray(apps)) {
        setApplications(apps);
      } else {
        console.error("Apps is not an array:", apps);
        setApplications([]);
      }
    } catch (error) {
      console.error("Error loading applications:", error);
      setApplications([]);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      // Import dynamically to avoid next/headers issues
      const { getApplicationCategoriesServerAction } = await import("@/app/[locale]/(protected)/security/application-categories/actions");
      const cats = await getApplicationCategoriesServerAction();
      console.log("Categories received:", cats);

      if (cats && Array.isArray(cats)) {
        setCategories(cats);
      } else {
        console.error("Categories is not an array:", cats);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadApplications(),
      loadCategories()
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    applications,
    categories,
    isLoadingApps,
    isLoadingCategories,
    loadApplications,
    loadCategories,
    loadData,
  };
}
