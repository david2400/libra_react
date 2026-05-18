// Client-safe API layer for roles actions
// Uses client-side API to avoid server-only import issues

import { clientApi } from '@/lib/client-api';
import type { 
  ICreateRole, 
  IUpdateRole,
  IRole
} from '@/server/domains/access-control/security/roles/types';

export const createRoleAction = async (payload: ICreateRole): Promise<{ success: boolean; data?: IRole; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const role = await clientApi.post<IRole>('/api/access_control/roles', payload);
    return { success: true, data: role };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to create role',
        details: error
      }
    };
  }
};

export const updateRoleAction = async (id: string | number, payload: IUpdateRole): Promise<{ success: boolean; data?: IRole; error?: { message: string; code?: string; details?: any } }> => {
  try {
    const role = await clientApi.put<IRole>(`/api/access_control/roles/${id}`, payload);
    return { success: true, data: role };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to update role',
        details: error
      }
    };
  }
};

export const deleteRoleAction = async (id: string | number): Promise<{ success: boolean; data?: void; error?: { message: string; code?: string; details?: any } }> => {
  try {
    await clientApi.delete(`/api/access_control/roles/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete role',
        details: error
      }
    };
  }
};
