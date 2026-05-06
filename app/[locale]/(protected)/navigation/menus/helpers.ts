import "server-only";

import { menusApi } from "@/lib/api";
import type { IMenu } from "@/server/domains/access-control/navigation/menus";

export const buildMenusData = async (): Promise<IMenu[]> => {
  const menusResponse = await menusApi.list({ per_page: 200 });
  const menus = (menusResponse as any)?.data ?? [];

  return menus;
};
