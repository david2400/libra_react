/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ProfileManager } from "@/modules/account/profiles/components/profile-manager";
import { IProfile, getProfiles } from "@/server/domains/access-control/account/profiles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "account.profiles" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const ProfilesPage = async () => {
  try {
    const profileResponse = await getProfiles();

    // Extract the data array from the paginated response
    const profileData: IProfile[] = Array.isArray(
      profileResponse,
    )
      ? profileResponse
      : profileResponse?.data || [];

    return <ProfileManager initialData={profileData} />;
  } catch (error) {
    console.error("Error loading themes:", error);
    // Return empty data if API fails
    return <ProfileManager initialData={[]} />;
  }
};

export default ProfilesPage;
