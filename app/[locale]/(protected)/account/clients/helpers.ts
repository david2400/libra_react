import "server-only";

import { clientsApi } from "@/lib/api";
import type { IClient } from "@/server/domains/access-control/account/clients";

export const buildClientsData = async (): Promise<IClient[]> => {
  const clientsResponse = await clientsApi.list({ per_page: 200 });
  const clients = (clientsResponse as any)?.data ?? [];

  return clients;
};
