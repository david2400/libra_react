'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  rolesRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateRolePayload, 
  IUpdateRolePayload,
} from './types';

// --- Roles Actions -----------------------------------------------------------

export const createRoleAction = async (payload: ICreateRolePayload): Promise<ActionResultType<any>> => {
  try {
    const role = await rolesRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roles());
    if (typeof role.id === 'string' || typeof role.id === 'number') {
      await revalidateCacheTag(accessControlTags.role(role.id));
    }
    
    return { success: true, data: role };
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
        message: 'Failed to create role',
        details: error
      }
    };
  }
};

export const updateRoleAction = async (id: string | number, payload: IUpdateRolePayload): Promise<ActionResultType<any>> => {
  try {
    const role = await rolesRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roles());
    await revalidateCacheTag(accessControlTags.role(id));
    
    return { success: true, data: role };
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
        message: 'Failed to update role',
        details: error
      }
    };
  }
};

export const deleteRoleAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await rolesRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roles());
    await revalidateCacheTag(accessControlTags.role(id));
    
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
        message: 'Failed to delete role',
        details: error
      }
    };
  }
};

