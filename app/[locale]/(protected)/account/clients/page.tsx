/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";


import { ClientManager } from "@/modules/account/clients/components/client-manager";
import { buildClientsData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("clients"),
    description: "Gestión de clientes del sistema.",
  };
}

const ClientsPage = async () => {
  const data = await buildClientsData();

  return <ClientManager initialData={data} />;
};

export default ClientsPage;
