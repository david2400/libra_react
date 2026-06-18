/** @format */

import { useState, useCallback, useMemo } from "react";
import { IUser } from "../models/user.interface";

interface ICompany {
  id_company: number;
  name: string;
  nit?: string;
  status?: string;
}

interface IClient {
  id_client?: number;
  first_name?: string;
  second_name?: string;
  first_last_name?: string;
  second_last_name?: string;
  type_id?: string;
  card_id?: string;
  status?: string;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byCompany: Record<number, number>;
  byClient: Record<number, number>;
}

interface UseUsersOptions {
  initialUsers?: IUser[];
  companies?: ICompany[];
  clients?: IClient[];
}

export function useUsers(options: UseUsersOptions = {}) {
  const { initialUsers = [], companies = [], clients = [] } = options;

  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar usuarios por empresa
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (selectedCompanyId) {
      filtered = filtered.filter((user) => user.company_id === selectedCompanyId);
    }

    if (selectedClientId) {
      filtered = filtered.filter((user) => user.client_id === selectedClientId);
    }

    return filtered;
  }, [users, selectedCompanyId, selectedClientId]);

  // Calcular estadísticas
  const stats = useMemo<UserStats>(() => {
    const active = users.filter((u) => u.status === "active").length;
    const inactive = users.filter((u) => u.status === "inactive").length;
    
    const byCompany: Record<number, number> = {};
    const byClient: Record<number, number> = {};

    users.forEach((user) => {
      if (user.company_id) {
        byCompany[user.company_id] = (byCompany[user.company_id] || 0) + 1;
      }
      if (user.client_id) {
        byClient[user.client_id] = (byClient[user.client_id] || 0) + 1;
      }
    });

    return {
      total: users.length,
      active,
      inactive,
      byCompany,
      byClient,
    };
  }, [users]);

  // Obtener nombre de empresa
  const getCompanyName = useCallback(
    (companyId: number) => {
      const company = companies.find((c) => c.id_company === companyId);
      return company?.name || "N/A";
    },
    [companies]
  );

  // Obtener nombre de cliente
  const getClientName = useCallback(
    (clientId: number) => {
      const client = clients.find((c) => c.id_client === clientId);
      return client
        ? `${client.first_name} ${client.first_last_name}`.trim()
        : "N/A";
    },
    [clients]
  );

  // CRUD Operations
  const addUser = useCallback((user: IUser) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const updateUser = useCallback((updatedUser: IUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id_user === updatedUser.id_user ? updatedUser : u))
    );
  }, []);

  const deleteUser = useCallback((userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id_user !== userId));
  }, []);

  const toggleUserStatus = useCallback((userId: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id_user && u.id_user === userId
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    );
  }, []);

  const bulkUpdateStatus = useCallback(
    (userIds: number[], status: "active" | "inactive") => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id_user && userIds.includes(u.id_user) ? { ...u, status } : u
        )
      );
    },
    []
  );

  const resetFilters = useCallback(() => {
    setSelectedCompanyId(null);
    setSelectedClientId(null);
  }, []);

  return {
    // Data
    users,
    filteredUsers,
    stats,
    
    // Filters
    selectedCompanyId,
    selectedClientId,
    
    // Loading
    isLoading,
    
    // Actions
    setSelectedCompanyId,
    setSelectedClientId,
    resetFilters,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    bulkUpdateStatus,
    
    // Helpers
    getCompanyName,
    getClientName,
  };
}
