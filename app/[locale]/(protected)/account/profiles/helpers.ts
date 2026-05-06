import "server-only";

import { profilesApi } from "@/lib/api";
import type { IProfile } from "@/server/domains/access-control/account/profiles";

export const buildProfilesData = async (): Promise<IProfile[]> => {
  const profilesResponse = await profilesApi.list({ per_page: 200 });
  const profiles = (profilesResponse as any)?.data ?? [];

  return profiles;
};
