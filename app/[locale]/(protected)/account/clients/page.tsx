/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { ClientManager } from "@/modules/account/clients/components/client-manager";
import type { IClient } from "@/server/domains/access-control/account/clients";
import type { IUser } from "@/server/domains/access-control/account/users";

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
  let clientData: IClient[] = [];
  let userData: IUser[] = [];

  try {
    // Importación dinámica para evitar errores de compilación
    const { getClients } = await import("@/server/domains/access-control/account/clients");
    const clientResponse = await getClients();

    // Extract the data array from the paginated response
    if (clientResponse) {
      if (Array.isArray(clientResponse)) {
        clientData = clientResponse;
      } else if ('content' in clientResponse && Array.isArray(clientResponse.content)) {
        clientData = clientResponse.content;
      } else if ('data' in clientResponse && Array.isArray(clientResponse.data)) {
        clientData = clientResponse.data;
      }
    }
  } catch (error) {
    console.error("Error loading clients:", error);
    // Continuar con array vacío
  }

  // try {
  //   // Cargar usuarios
  //   const { usersRepository } = await import("@/server/domains/access-control/account/users");
  //   const usersResponse = await usersRepository.list();

  //   if (usersResponse) {
  //     if (Array.isArray(usersResponse)) {
  //       userData = usersResponse;
  //     } else if ('content' in usersResponse && Array.isArray(usersResponse.content)) {
  //       userData = usersResponse.content;
  //     } else if ('data' in usersResponse && Array.isArray(usersResponse.data)) {
  //       userData = usersResponse.data;
  //     }
  //   }
  // } catch (error) {
  //   console.error("Error loading users:", error);
  //   // Continuar con array vacío
  // }

  return (
    <ClientManager 
      initialData={clientData} 
      // initialUsers={userData}
    />
  );
};

export default ClientsPage;
