// Client-safe API layer for permissions actions
// Uses client-side API to avoid server-only import issues

import { clientApi } from '@/lib/client-api';
import type { 
  ICreatePermission, 
  IUpdatePermission,
  IPermission
} from '@/server/domains/access-control/security/permissions/types';

export const createPermissionAction = async (payload: ICreatePermission): Promise<{ success: boolean; data?: IPermission; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const permission = await clientApi.post<IPermission>('/api/access_control/permissions', payload);
    return { success: true, data: permission };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to create permission',
        details: error
      }
    };
  }
};

export const updatePermissionAction = async (id: string | number, payload: IUpdatePermission): Promise<{ success: boolean; data?: IPermission; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const permission = await clientApi.put<IPermission>(`/api/access_control/permissions/${id}`, payload);
    return { success: true, data: permission };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update permission',
        details: error
      }
    };
  }
};

export const deletePermissionAction = async (id: string | number): Promise<{ success: boolean; data?: void; error?: { message: string; code?: string; details?: any } }> => {
  try {
    await clientApi.delete(`/api/access_control/permissions/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete permission',
        details: error
      }
    };
  }
};
