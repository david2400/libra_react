/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";

import { UserManager } from "@/modules/account/users/components/user-manager";
import { IUser, getUsers } from "@/server/domains/access-control/account/users";
import {
  listClientsServerAction,
  type IClient,
} from "@/server/domains/access-control/account/clients";
import {
  getCompaniesServerAction,
  getUsersServerAction,
} from "../user-companies/actions";
import { type ICompany } from "@/server/domains/access-control/account/companies";

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

    const userData: IUser[] = Array.isArray(userResponse)
      ? userResponse
      : userResponse?.content || [];
    console.log("userData", userData);
    return (
      <UserManager
        initialData={userData}
        // companies={companiesData}
        // clients={clientsData}
      />
    );
  } catch (error) {
    return (
      <UserManager
        initialData={[]}
        // companies={companiesData}
        // clients={clientsData}
      />
    );
  }
};

export default UsersPage;
