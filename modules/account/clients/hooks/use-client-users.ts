"use client";

import { useState, useCallback, useMemo } from "react";
import { IUser } from "@/modules/account/users/models/user.interface";

/**
 * Hook para gestionar usuarios asociados a un cliente
 * Principio: Single Responsibility - Solo maneja la lógica de usuarios del cliente
 */
export function useClientUsers(clientId?: number, initialUsers: IUser[] = []) {
  const [users, setUsers] = useState<IUser[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar usuarios por cliente
  const clientUsers = useMemo(() => {
    if (!clientId) return [];
    return users.filter(user => user.client_id === clientId);
  }, [users, clientId]);

  // Estadísticas de usuarios
  const stats = useMemo(() => {
    const activeUsers = clientUsers.filter(user => user.status === 'active').length;
    const inactiveUsers = clientUsers.length - activeUsers;
    
    return {
      total: clientUsers.length,
      active: activeUsers,
      inactive: inactiveUsers,
    };
  }, [clientUsers]);

  // Cargar usuarios del cliente
  const loadUsers = useCallback(async (clientId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Importación dinámica para evitar problemas de next/headers
      const { getUsersByClientAction } = await import("@/app/[locale]/(protected)/account/users/actions");
      const result = await getUsersByClientAction(clientId);
      
      if (result && Array.isArray(result)) {
        setUsers(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading users');
      console.error('Error loading client users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Agregar usuario
  const addUser = useCallback((user: IUser) => {
    setUsers(prev => [...prev, user]);
  }, []);

  // Actualizar usuario
  const updateUser = useCallback((userId: number, updates: Partial<IUser>) => {
    setUsers(prev => prev.map(user => 
      user.id_user === userId ? { ...user, ...updates } : user
    ));
  }, []);

  // Eliminar usuario
  const removeUser = useCallback((userId: number) => {
    setUsers(prev => prev.filter(user => user.id_user !== userId));
  }, []);

  // Activar/Desactivar usuario
  const toggleUserStatus = useCallback(async (userId: number) => {
    const user = users.find(u => u.id_user === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUser(userId, { status: newStatus });
  }, [users, updateUser]);

  return {
    users: clientUsers,
    allUsers: users,
    stats,
    isLoading,
    error,
    loadUsers,
    addUser,
    updateUser,
    removeUser,
    toggleUserStatus,
  };
}
