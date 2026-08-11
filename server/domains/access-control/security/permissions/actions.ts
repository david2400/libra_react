'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  permissionsRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type {
  ICreatePermission,
  IUpdatePermission,
} from './types';
import { rolePermissionsRepository } from '../role_permissions';

// --- Permissions Actions ---------------------------------------------------------

export const createPermissionAction = async (payload: ICreatePermission): Promise<ActionResultType<any>> => {
  try {
    const permission = await permissionsRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.permissions());
    if (typeof permission.id_permission === 'string' || typeof permission.id_permission === 'number') {
      await revalidateCacheTag(accessControlTags.permission(permission.id_permission));
    }
    
    return { success: true, data: permission };
  } catch (error) {
    throw error;
  }
};

export const updatePermissionAction = async (id: string | number, payload: IUpdatePermission): Promise<ActionResultType<any>> => {
  try {
    const permission = await permissionsRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.permissions());
    await revalidateCacheTag(accessControlTags.permission(id));
    
    return { success: true, data: permission };
  } catch (error) {
    throw error;
  }
};

export const deletePermissionAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await permissionsRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.permissions());
    await revalidateCacheTag(accessControlTags.permission(id));
    
    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};
