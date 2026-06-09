/** @format */

/**
 * EJEMPLO DE PÁGINA PARA USER-COMPANIES
 * 
 * Este archivo muestra cómo crear la página en:
 * app/[locale]/(protected)/account/user-companies/page.tsx
 */

import { Metadata, NextPage } from "next";
import { getTranslations } from "next-intl/server";
import { UserCompanyManager } from "@/modules/account/user-companies";
import type { IUserCompanyWithDetails } from "@/modules/account/user-companies";
import type { IUser } from "@/server/domains/access-control/account/users";
import type { ICompany } from "@/server/domains/access-control/account/companies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
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

const UserCompaniesPage: NextPage = async () => {
  let userCompaniesData: IUserCompanyWithDetails[] = [];
  let usersData: IUser[] = [];
  let companiesData: ICompany[] = [];

  try {
    // TODO: Cargar asignaciones de empresas a usuarios
    // const { getUserCompanies } = await import(
    //   "@/server/domains/access-control/account/user-companies"
    // );
    // const response = await getUserCompanies();
    // userCompaniesData = Array.isArray(response) ? response : response.content || [];

    // MOCK DATA para desarrollo
    userCompaniesData = [
      {
        id_user_company: 1,
        user_id: 1,
        company_id: 1,
        user_name: "admin",
        company_name: "Empresa Demo",
        company_nit: "123456789",
        is_primary: true,
        status: "active",
        assigned_date: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error("Error loading user companies:", error);
  }

  try {
    // Cargar usuarios
    const { getUsers } = await import(
      "@/server/domains/access-control/account/users"
    );
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
    const { getCompanies } = await import(
      "@/server/domains/access-control/account/companies"
    );
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
    />
  );
};

export default UserCompaniesPage;
