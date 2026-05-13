/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PolicyManager } from "@/modules/security/policies";
import { IPolicy, getPolicies } from "@/server/domains/access-control/security/policies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("policies"),
    description: "Gestión de políticas del sistema.",
  };
}

const PoliciesPage = async () => {
  try {
    const policiesResponse = await getPolicies();

    // Extract the data array from the paginated response
    const policiesData: IPolicy[] = Array.isArray(
      policiesResponse,
    )
      ? policiesResponse
      : policiesResponse?.data || [];

    return <PolicyManager initialData={policiesData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <PolicyManager initialData={[]} />;
  }
};

export default PoliciesPage;
