import "server-only";

import { usersApi } from "@/lib/api";
import type { IUser } from "@/server/domains/access-control/account/users";

export const buildUsersData = async (): Promise<IUser[]> => {
  const usersResponse = await usersApi.list({ per_page: 200 });
  const users = (usersResponse as any)?.data ?? [];

  return users;
};
