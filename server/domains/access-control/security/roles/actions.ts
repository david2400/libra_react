'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import {
  rolesRepository,
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type {
  ICreateRole,
  IUpdateRole,
} from './types';

// --- Roles Actions -----------------------------------------------------------

export const createRoleAction = async (payload: ICreateRole): Promise<ActionResultType<any>> => {
  try {
    const role = await rolesRepository.create(payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roles());
    if (typeof role.id_role === 'string' || typeof role.id_role === 'number') {
      await revalidateCacheTag(accessControlTags.role(role.id_role));
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

export const updateRoleAction = async (id_role: string | number, payload: IUpdateRole): Promise<ActionResultType<any>> => {
  try {
    const role = await rolesRepository.update(id_role, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roles());
    await revalidateCacheTag(accessControlTags.role(id_role));

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

export const deleteRoleAction = async (id_role: string | number): Promise<ActionResultType<void>> => {
  try {
    await rolesRepository.delete(id_role);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roles());
    await revalidateCacheTag(accessControlTags.role(id_role));

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

