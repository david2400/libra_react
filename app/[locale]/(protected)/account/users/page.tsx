/** @format */

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { UserManager } from "@/modules/account/users/components/user-manager";

import { buildUsersData } from "./helpers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale, namespace: "account.users" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const UsersPage = async () => {
  const data = await buildUsersData();

  return <UserManager initialData={data} />;
};

export default UsersPage;
