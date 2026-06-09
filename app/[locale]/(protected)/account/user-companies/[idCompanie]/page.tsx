/** @format */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";
import { UserCompanyManager } from "@/modules/account/user-companies";
import { getCompanyUsersServerAction } from "./actions";
import { getUsers } from "@/server/domains/access-control/account/users";
import { getCompanies } from "@/server/domains/access-control/account/companies";
import type { IUserCompanyResponse } from "@/server/domains/access-control/account/user-companies";
import type { IUser } from "@/server/domains/access-control/account/users";
import type { ICompany } from "@/server/domains/access-control/account/companies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; idCompanie: string }>;
}): Promise<Metadata> {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({
    locale,
    namespace: "account.userCompanies",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

interface UserCompaniesPageProps {
  params: Promise<{ idCompanie: string }>;
}

const UserCompaniesPage: NextPage<UserCompaniesPageProps> = async ({ params }) => {
  const { idCompanie } = await Promise.resolve(params);
  const companyId = parseInt(idCompanie, 10);
  
  let userCompaniesData: IUserCompanyResponse[] = [];
  let usersData: IUser[] = [];
  let companiesData: ICompany[] = [];

  // Cargar usuarios asignados a esta empresa
  try {
    userCompaniesData = await getCompanyUsersServerAction(companyId);
  } catch (error) {
    console.error("Error loading company users:", error);
  }

  try {
    // Cargar usuarios
    const usersResponse = await getUsers();

    if (usersResponse) {
      if (Array.isArray(usersResponse)) {
        usersData = usersResponse;
      } else if (
        "content" in usersResponse &&
        Array.isArray(usersResponse.content)
      ) {
        usersData = usersResponse.content;
      } else if (
        "data" in usersResponse &&
        Array.isArray(usersResponse.data)
      ) {
        usersData = usersResponse.data;
      }
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }

  try {
    // Cargar empresas
    const companiesResponse = await getCompanies();

    if (companiesResponse) {
      if (Array.isArray(companiesResponse)) {
        companiesData = companiesResponse;
      } else if (
        "content" in companiesResponse &&
        Array.isArray(companiesResponse.content)
      ) {
        companiesData = companiesResponse.content;
      } else if (
        "data" in companiesResponse &&
        Array.isArray(companiesResponse.data)
      ) {
        companiesData = companiesResponse.data;
      }
    }
  } catch (error) {
    console.error("Error loading companies:", error);
  }

  return (
    <UserCompanyManager
      initialData={userCompaniesData}
      users={usersData}
      companies={companiesData}
      companyId={companyId}
    />
  );
};

export default UserCompaniesPage;
