/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";
import {
  IPolicy,
  getPolicies,
} from "@/server/domains/access-control/security/policies";
import { PolicyManager } from "@/modules/security/policies/components/policy-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "security.policies" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const PoliciesPage: NextPage = async () => {
  try {
    const policiesResponse = await getPolicies();

    // Extract the data array from the paginated response
    const policiesData: IPolicy[] = Array.isArray(policiesResponse)
      ? policiesResponse
      : policiesResponse?.content || [];

    return <PolicyManager initialData={policiesData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <PolicyManager initialData={[]} />;
  }
};

export default PoliciesPage;
