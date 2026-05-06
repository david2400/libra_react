/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ProfileManager } from "@/modules/account/profiles/components/profile-manager";

import { buildProfilesData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "Titles" });

  return {
    title: t("profiles"),
    description: "Gestión de perfiles de usuario.",
  };
}

const ProfilesPage = async () => {
  const data = await buildProfilesData();

  return <ProfileManager initialData={data} />;
};

export default ProfilesPage;
