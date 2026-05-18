// Client-safe API layer for role-permissions actions
// Uses client-side API to avoid server-only import issues

import { clientApi } from '@/lib/client-api';
import type { 
  ICreateRolePermission, 
  IUpdateRolePermission,
  IRolePermission
} from '@/server/domains/access-control/security/role_permissions/types';

export const createRolePermissionAction = async (payload: ICreateRolePermission): Promise<{ success: boolean; data?: IRolePermission; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const rolePermission = await clientApi.post<IRolePermission>('/api/access_control/role_permissions', payload);
    return { success: true, data: rolePermission };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to create role permission',
        details: error
      }
    };
  }
};

export const updateRolePermissionAction = async (id: string | number, payload: IUpdateRolePermission): Promise<{ success: boolean; data?: IRolePermission; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const rolePermission = await clientApi.put<IRolePermission>(`/api/access_control/role_permissions/${id}`, payload);
    return { success: true, data: rolePermission };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update role permission',
        details: error
      }
    };
  }
};

export const deleteRolePermissionAction = async (id: string | number): Promise<{ success: boolean; data?: void; error?: { message: string; code?: string; details?: any } }> => {
  try {
    await clientApi.delete(`/api/access_control/role_permissions/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete role permission',
        details: error
      }
    };
  }
};
