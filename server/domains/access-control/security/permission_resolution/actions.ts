'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import { permissionResolutionRepository } from './repository';

// --- IPermission Resolution Actions ---------------------------------------------

// Note: IPermission resolution is primarily read-only, but we include actions
// for operations that might trigger cache invalidation or logging

export const checkPermissionAction = async (
  userId: number, 
  permissionCode: string, 
  requiredLevel: string
): Promise<ActionResultType<boolean>> => {
  try {
    const hasPermission = await permissionResolutionRepository.hasPermission(
      userId, 
      permissionCode, 
      requiredLevel
    );
    
    return { success: true, data: hasPermission };
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
        message: 'Failed to check permission',
        details: error
      }
    };
  }
};

export const checkAnyPermissionAction = async (
  userId: number, 
  permissionCodes: string[]
): Promise<ActionResultType<boolean>> => {
  try {
    const hasAny = await permissionResolutionRepository.hasAnyPermission(
      userId, 
      permissionCodes
    );
    
    return { success: true, data: hasAny };
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
        message: 'Failed to check any permission',
        details: error
      }
    };
  }
};

export const checkAllPermissionsAction = async (
  userId: number, 
  permissionCodes: string[]
): Promise<ActionResultType<boolean>> => {
  try {
    const hasAll = await permissionResolutionRepository.hasAllPermissions(
      userId, 
      permissionCodes
    );
    
    return { success: true, data: hasAll };
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
        message: 'Failed to check all permissions',
        details: error
      }
    };
  }
};

// Action to refresh permission cache for a user
export const refreshUserPermissionsAction = async (userId: number): Promise<ActionResultType<void>> => {
  try {
    // Revalidate all permission-related cache tags for this user
    await revalidateCacheTag(accessControlTags.user(userId));
    await revalidateCacheTag(accessControlTags.permissions());
    await revalidateCacheTag(accessControlTags.userPermissions());
    
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to refresh user permissions cache',
        details: error
      }
    };
  }
};
