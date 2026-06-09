"use client";

import { useState, useEffect } from "react";
import { IUser } from "@/server/domains/access-control/account/users";
import { ICompany } from "@/server/domains/access-control/account/companies";

export function useCompanyData() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const { getUsersServerAction } = await import("@/app/[locale]/(protected)/account/user-companies/actions");
      const result = await getUsersServerAction();
      console.log("Users received:", result);

      if (result && Array.isArray(result)) {
        setUsers(result);
      } else {
        console.error("Users is not an array:", result);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const { getCompaniesServerAction } = await import("@/app/[locale]/(protected)/account/user-companies/actions");
      const result = await getCompaniesServerAction();
      console.log("Companies received:", result);

      if (result && Array.isArray(result)) {
        setCompanies(result);
      } else {
        console.error("Companies is not an array:", result);
        setCompanies([]);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadUsers(),
      loadCompanies()
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    users,
    companies,
    isLoadingUsers,
    isLoadingCompanies,
    loadUsers,
    loadCompanies,
    loadData,
  };
}
