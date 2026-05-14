/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ClientManager } from "@/modules/account/clients/components/client-manager";
import { IClient, getClients } from "@/server/domains/access-control/account/clients";

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

const ClientsPage = async () => {
  try {
    const modulesApplicationResponse = await getClients();

    // Extract the data array from the paginated response
    const modulesApplicationData: IClient[] = Array.isArray(
      modulesApplicationResponse,
    )
      ? modulesApplicationResponse
      : modulesApplicationResponse?.data || [];

    return <ClientManager initialData={modulesApplicationData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <ClientManager initialData={[]} />;
  }
};

export default ClientsPage;
