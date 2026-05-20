/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { UserManager } from "@/modules/account/users/components/user-manager";
import { IUser, getUsers } from "@/server/domains/access-control/account/users";

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

const UsersPage: NextPage = async () => {
  try {
    const userResponse = await getUsers();

    const usersData: IUser[] = Array.isArray(userResponse)
      ? userResponse
      : userResponse?.data || [];

    return <UserManager initialData={usersData} />;
  } catch (error) {
    return <UserManager initialData={[]} />;
  }
};

export default UsersPage;
