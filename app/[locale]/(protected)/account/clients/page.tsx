/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { ClientManager } from "@/modules/account/clients/components/client-manager";
import {
  IClient,
  getClients,
} from "@/server/domains/access-control/account/clients";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "account.clients" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const ClientsPage: NextPage = async () => {
  try {
    const clientResponse = await getClients();

    // Extract the data array from the paginated response
    const clientData: IClient[] = Array.isArray(clientResponse)
      ? clientResponse
      : clientResponse?.data || [];

    return <ClientManager initialData={clientData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <ClientManager initialData={[]} />;
  }
};

export default ClientsPage;
