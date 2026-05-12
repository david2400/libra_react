'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  permissionsRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreatePermissionPayload, 
  IUpdatePermissionPayload,
} from './types';
import { rolePermissionsRepository } from '../role_permissions';

// --- Permissions Actions ---------------------------------------------------------

export const createPermissionAction = async (payload: ICreatePermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const permission = await permissionsRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.permissions());
    if (typeof permission.id === 'string' || typeof permission.id === 'number') {
      await revalidateCacheTag(accessControlTags.permission(permission.id));
    }
    
    return { success: true, data: permission };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to create permission',
        details: error
      }
    };
  }
};

export const updatePermissionAction = async (id: string | number, payload: IUpdatePermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const permission = await permissionsRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.permissions());
    await revalidateCacheTag(accessControlTags.permission(id));
    
    return { success: true, data: permission };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to update permission',
        details: error
      }
    };
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
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Failed to delete permission',
        details: error
      }
    };
  }
};
