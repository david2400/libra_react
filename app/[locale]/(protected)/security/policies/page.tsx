/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PolicyManager } from "@/modules/security/policies";

import { buildPoliciesData } from "./helpers";

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
  const data = await buildPoliciesData();

  return <PolicyManager initialData={data} />;
};

export default PoliciesPage;
