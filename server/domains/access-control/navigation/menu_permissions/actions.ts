'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import {
  menuPermissionsRepository,
  menuPermissionStatsRepository,
  menuPermissionBulkRepository,
  menuPermissionValidationRepository,
  menuPermissionActivityRepository,
  menuPermissionInheritanceRepository,
  menuPermissionConflictRepository,
  menuPermissionExportRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type {
  IBulkMenuPermissionPayload,
  IBulkMenuPermissionResponse,
  IMenuPermissionActivity,
  IMenuPermissionValidationRequest,
  IMenuPermissionExportRequest,
  ICreateMenuPermission,
  IUpdateMenuPermission,
  IMenuPermission,
  IMenuPermissionBulkItem,
  IMenuPermissionBulkRequest
} from './types';

// --- MenuPermission Entity Actions (Based on Java MenuPermissionEntity) -------


// Helper function to create activity log (compatible with current repository)
const createActivityLog = async (activity: {
  menu_id: number;
  role_id?: number;
  user_id?: number;
  activity_type: string;
  description: string;
  metadata?: Record<string, unknown>;
}) => {
  try {
    await menuPermissionActivityRepository.create(activity as any);
  } catch (error) {
    console.warn('Failed to create activity log:', error);
  }
};

// Create MenuPermission with new Java entity structure
export const createMenuPermissionAction = async (payload: ICreateMenuPermission): Promise<ActionResultType<IMenuPermission>> => {
  try {

    // Create the permission using the existing repository
    // For now, we'll use role_id as the second parameter (permissionId in old structure)
    const menuPermission = await menuPermissionsRepository.create(
      payload.menu_id,
      payload.role_id || 0,
      payload
    );

    // Add computed properties to the returned object
    const enhancedPermission = {
      ...menuPermission,
      is_expired: payload.expires_at ? new Date() > new Date(payload.expires_at) : false
    } as IMenuPermission;

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(payload.menu_id));

    if (payload.role_id) {
      await revalidateCacheTag(accessControlTags.role(payload.role_id));
    }
    if (payload.user_id) {
      await revalidateCacheTag(accessControlTags.user(payload.user_id));
    }

    // Log activity
    await createActivityLog({
      menu_id: payload.menu_id,
      role_id: payload.role_id,
      user_id: payload.user_id,
      activity_type: 'permission_granted',
      description: ` permission granted to menu`,
      metadata: {
        menu_id: payload.menu_id,
        role_id: payload.role_id,
        user_id: payload.user_id,
        permissions: {
          create_permission: payload.create_permission,
          update_permission: payload.update_permission,
          delete_permission: payload.delete_permission,
          consult_permission: payload.consult_permission
        }
      }
    });

    return { success: true, data: enhancedPermission };
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
        message: 'Failed to create menu permission',
        details: error
      }
    };
  }
};

// Update MenuPermission
export const updateMenuPermissionAction = async (id: number, payload: IUpdateMenuPermission): Promise<ActionResultType<IMenuPermission>> => {
  try {
    // Get existing permission to maintain assignment type
    const existing = await menuPermissionsRepository.getById?.(id) || { menu_id: 0, role_id: 0 };

    // Update using existing repository signature (menuId, permissionId, payload)
    const menuPermission = await menuPermissionsRepository.update(
      existing.menu_id,
      existing.role_id || 0,
      payload
    );

    // Add computed properties
    const enhancedPermission = {
      ...menuPermission,
      is_expired: payload.expires_at ? new Date() > new Date(payload.expires_at) : false
    } as IMenuPermission;

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(enhancedPermission.menu_id));

    if (enhancedPermission.role_id) {
      await revalidateCacheTag(accessControlTags.role(enhancedPermission.role_id));
    }
    if (enhancedPermission.user_id) {
      await revalidateCacheTag(accessControlTags.user(enhancedPermission.user_id));
    }

    // Log activity
    await createActivityLog({
      menu_id: enhancedPermission.menu_id,
      role_id: enhancedPermission.role_id,
      user_id: enhancedPermission.user_id,
      activity_type: 'permission_updated',
      description: `permission updated`,
      metadata: {
        updated_fields: Object.keys(payload),
      }
    });

    return { success: true, data: enhancedPermission };
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
        message: 'Failed to update menu permission',
        details: error
      }
    };
  }
};

// Delete MenuPermission
export const deleteMenuPermissionAction = async (id: number): Promise<ActionResultType<void>> => {
  try {
    // Get permission before deletion for logging
    const existing = await menuPermissionsRepository.getById?.(id) || { menu_id: 0, role_id: 0 };

    await menuPermissionsRepository.delete(id);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(existing.menu_id));

    if (existing.role_id) {
      await revalidateCacheTag(accessControlTags.role(existing.role_id));
    }
    if (existing.user_id) {
      await revalidateCacheTag(accessControlTags.user(existing.user_id));
    }

    // Log activity
    await createActivityLog({
      menu_id: existing.menu_id,
      role_id: existing.role_id,
      user_id: existing.user_id,
      activity_type: 'permission_revoked',
      description: 'Permission revoked from menu',
      metadata: {
        menu_id: existing.menu_id,
        role_id: existing.role_id,
        user_id: existing.user_id
      }
    });

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
        message: 'Failed to delete menu permission',
        details: error
      }
    };
  }
};

// --- MenuPermission Priority Resolution Actions -------------------------------

// Get effective permissions for a role/user considering priority
export const getEffectiveMenuPermissionsAction = async (
  menuId: number,
  roleId?: number,
  userId?: number
): Promise<ActionResultType<IMenuPermission>> => {
  try {
    // Get all permissions for this menu
    const allPermissions = await menuPermissionsRepository.list({
      menu_id: menuId
    });

    // Filter by role/user and sort by priority (USER > ROLE > PERMISSION)
    const relevantPermissions = allPermissions.content
      .filter(p =>
        (userId && p.user_id === userId) ||
        (roleId && p.role_id === roleId) ||
        (!userId && !roleId) // PERMISSION type
      )
      .sort((a, b) => {
        // Calculate priority based on assignment type
        const getPriority = (p: any) => {
          if (p.user_id) return 100;
          if (p.role_id) return 50;
          return 0;
        };
        return getPriority(b) - getPriority(a); // Descending order
      });

    // Merge permissions by priority (highest priority wins)
    const effectivePermission = relevantPermissions.reduce((acc: any, current: any) => {
      if (!acc) return current;

      // Merge permissions, with current (higher priority) taking precedence
      return {
        ...acc,
        create_permission: current.create_permission ?? acc.create_permission,
        update_permission: current.update_permission ?? acc.update_permission,
        delete_permission: current.delete_permission ?? acc.delete_permission,
        consult_permission: current.consult_permission ?? acc.consult_permission,
      };
    }, null);

    if (!effectivePermission) {
      return {
        success: false,
        error: {
          message: 'No permissions found',
          details: { menuId, roleId, userId }
        }
      };
    }

    // Add computed properties
    const enhancedPermission = {
      ...effectivePermission,
      is_expired: effectivePermission.expires_at ? new Date() > new Date(effectivePermission.expires_at) : false
    } as IMenuPermission;

    return { success: true, data: enhancedPermission };
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
        message: 'Failed to get effective menu permissions',
        details: error
      }
    };
  }
};

// Get all menu permissions for a specific role
export const getMenuPermissionsByRoleAction = async (roleId: number): Promise<ActionResultType<IMenuPermission[]>> => {
  try {
    // Use the search endpoint instead of list to filter by role_id
    const permissions = await menuPermissionsRepository.getMenusPermission({ role_id: roleId });

    // Add computed properties to all permissions
    const enhancedPermissions = permissions.map(p => {
      return {
        ...p,
        is_expired: p.expires_at ? new Date() > new Date(p.expires_at) : false
      } as IMenuPermission;
    });

    return {
      success: true,
      data: enhancedPermissions
    };
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
        message: 'Failed to get menu permissions by role',
        details: error
      }
    };
  }
};

// --- MenuPermission Bulk Operations (Simplified) ------------------------------

export const bulkAssignMenuPermissionsAction = async (payload: IBulkMenuPermissionPayload): Promise<ActionResultType<IBulkMenuPermissionResponse>> => {
  try {
    // For now, create a single permission (bulk operations need repository updates)
    const result = await createMenuPermissionAction(payload as ICreateMenuPermission);

    if (!result.success) {
      return result as ActionResultType<IBulkMenuPermissionResponse>;
    }

    const bulkResponse: IBulkMenuPermissionResponse = {
      successful: [result.data!],
      failed: [],
      summary: {
        total: 1,
        successful: 1,
        failed: 0
      }
    };

    return { success: true, data: bulkResponse };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to bulk assign menu permissions',
        details: error
      }
    };
  }
};

// --- MenuPermission Bulk Save/Delete (Spring Boot bulk endpoints) -------------

/**
 * Create/update multiple menu permissions in a single request.
 * Items with `idMenuPermission === null` are created, the rest are updated.
 * The payload is sent as-is (camelCase) to match the Spring Boot DTO.
 */
export const bulkSaveMenuPermissionsAction = async (
  items: IMenuPermissionBulkItem[],
): Promise<ActionResultType<IBulkMenuPermissionResponse>> => {
  try {
    if (!items || items.length === 0) {
      return {
        success: true,
        data: { successful: [], failed: [], summary: { total: 0, successful: 0, failed: 0 } },
      };
    }

    const request: IMenuPermissionBulkRequest = { menu_permissions: items };
    const response = await menuPermissionBulkRepository.bulkSave<IBulkMenuPermissionResponse>(request);

    // Revalidate affected caches
    await revalidateCacheTag(accessControlTags.menuPermissions());
    const menuIds = new Set(items.map((i) => i.menu_id));
    const roleIds = new Set(items.map((i) => i.role_id).filter((v): v is number => v != null));
    const userIds = new Set(items.map((i) => i.user_id).filter((v): v is number => v != null));
    await Promise.all([
      ...[...menuIds].map((id) => revalidateCacheTag(accessControlTags.menu(id))),
      ...[...roleIds].map((id) => revalidateCacheTag(accessControlTags.role(id))),
      ...[...userIds].map((id) => revalidateCacheTag(accessControlTags.user(id))),
    ]);

    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: { message: error.message, code: error.code, details: error.details },
      };
    }
    return {
      success: false,
      error: { message: 'Failed to bulk save menu permissions', details: error },
    };
  }
};

/**
 * Delete multiple menu permissions by their ids.
 */
export const bulkDeleteMenuPermissionsAction = async (
  ids: number[],
): Promise<ActionResultType<void>> => {
  try {
    const validIds = (ids || []).filter((id): id is number => typeof id === 'number');
    if (validIds.length === 0) {
      return { success: true, data: undefined };
    }

    await menuPermissionBulkRepository.bulkDelete<void>(validIds);
    await revalidateCacheTag(accessControlTags.menuPermissions());

    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: { message: error.message, code: error.code, details: error.details },
      };
    }
    return {
      success: false,
      error: { message: 'Failed to bulk delete menu permissions', details: error },
    };
  }
};

// --- MenuPermission Validation (Simplified) ----------------------------------

export const validateMenuPermissionAction = async (request: IMenuPermissionValidationRequest): Promise<ActionResultType<any>> => {
  try {
    // Basic validation - check if permission exists and is not expired
    const permissions = await menuPermissionsRepository.list({
      menu_id: request.menu_id,
      role_id: request.role_id,
      user_id: request.user_id
    });

    const validPermissions = permissions.content.filter(p => {
      const isExpired = p.expires_at ? new Date() > new Date(p.expires_at) : false;
      return !isExpired;
    });

    return {
      success: true,
      data: {
        is_valid: validPermissions.length > 0,
        permissions: validPermissions,
        validation_details: {
          total_permissions: permissions.content.length,
          valid_permissions: validPermissions.length,
          expired_permissions: permissions.content.length - validPermissions.length
        }
      }
    };
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
        message: 'Failed to validate menu permission',
        details: error
      }
    };
  }
};

// --- Export additional functions for backward compatibility --------------------

// List menu permissions with filters
export const listMenuPermissionsAction = async (filters?: any): Promise<ActionResultType<IMenuPermission[]>> => {
  try {
    const permissions = await menuPermissionsRepository.list(filters);

    // Add computed properties to all permissions
    const enhancedPermissions = permissions.content.map(p => {
      return {
        ...p,
        is_expired: p.expires_at ? new Date() > new Date(p.expires_at) : false
      } as IMenuPermission;
    });

    return { success: true, data: enhancedPermissions };
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
        message: 'Failed to list menu permissions',
        details: error
      }
    };
  }
};

// Get menu permission by ID
export const getMenuPermissionByIdAction = async (id: number): Promise<ActionResultType<IMenuPermission>> => {
  try {
    const permission = await menuPermissionsRepository.getById?.(id);

    if (!permission) {
      return {
        success: false,
        error: {
          message: 'Menu permission not found',
          details: { id }
        }
      };
    }

    // Add computed properties
    const enhancedPermission = {
      ...permission,
      is_expired: permission.expires_at ? new Date() > new Date(permission.expires_at) : false
    } as IMenuPermission;

    return { success: true, data: enhancedPermission };
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
        message: 'Failed to get menu permission',
        details: error
      }
    };
  }
};
