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
  ICreateMenuPermissionPayload, 
  IUpdateMenuPermissionPayload,
  IBulkMenuPermissionPayload,
  IMenuPermissionActivity,
  IMenuPermissionValidationRequest,
  IMenuPermissionExportRequest
} from './types';

// --- IMenu-IPermission Relationships Actions ---------------------------------

export const createMenuPermissionAction = async (menuId: string | number, permissionId: string | number, payload: ICreateMenuPermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const menuPermission = await menuPermissionsRepository.create(menuId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menuPermission(menuId, permissionId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    await revalidateCacheTag(accessControlTags.permission(permissionId));
    
    // Log activity
    await menuPermissionActivityRepository.create({
      menuId: menuId,
      permissionId: permissionId,
      activityType: 'permission_granted',
      description: 'IPermission granted to menu',
      metadata: { isActive: payload.isActive }
    });
    
    return { success: true, data: menuPermission };
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
        message: 'Failed to create menu-permission relationship',
        details: error
      }
    };
  }
};

export const updateMenuPermissionAction = async (menuId: string | number, permissionId: string | number, payload: IUpdateMenuPermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const menuPermission = await menuPermissionsRepository.update(menuId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menuPermission(menuId, permissionId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log activity
    await menuPermissionActivityRepository.create({
      menuId: menuId,
      permissionId: permissionId,
      activityType: 'permission_updated',
      description: 'IMenu-permission relationship updated',
      metadata: { updated_fields: Object.keys(payload) }
    });
    
    return { success: true, data: menuPermission };
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
        message: 'Failed to update menu-permission relationship',
        details: error
      }
    };
  }
};

export const deleteMenuPermissionAction = async (menuId: string | number, permissionId: string | number): Promise<ActionResultType<void>> => {
  try {
    await menuPermissionsRepository.delete(menuId, permissionId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menuPermission(menuId, permissionId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    await revalidateCacheTag(accessControlTags.permission(permissionId));
    
    // Log activity
    await menuPermissionActivityRepository.create({
      menuId: menuId,
      permissionId: permissionId,
      activityType: 'permission_revoked',
      description: 'IPermission revoked from menu'
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
        message: 'Failed to delete menu-permission relationship',
        details: error
      }
    };
  }
};

// --- IMenu-IPermission Bulk Operations Actions -----------------------------

export const bulkAssignMenuPermissionsAction = async (payload: IBulkMenuPermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await menuPermissionBulkRepository.bulkAssign(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(payload.menuId));
    
    // Log activity for successful assignments
    for (const menuPermission of result.successful) {
      await menuPermissionActivityRepository.create({
        menuId: payload.menuId,
        permissionId: menuPermission.permissionId,
        activityType: 'permission_granted',
        description: 'IPermission granted to menu (bulk operation)',
        metadata: { bulk_operation: true }
      });
    }
    
    return { success: true, data: result };
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
        message: 'Failed to bulk assign menu permissions',
        details: error
      }
    };
  }
};

export const bulkRemoveMenuPermissionsAction = async (menuId: string | number, permissionIds: (string | number)[]): Promise<ActionResultType<any>> => {
  try {
    const result = await menuPermissionBulkRepository.bulkRemove(menuId, permissionIds);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log activity for successful removals
    for (const menuPermission of result.successful) {
      await menuPermissionActivityRepository.create({
        menuId: menuId,
        permissionId: menuPermission.permissionId,
        activityType: 'permission_revoked',
        description: 'IPermission revoked from menu (bulk operation)',
        metadata: { bulk_operation: true }
      });
    }
    
    return { success: true, data: result };
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
        message: 'Failed to bulk remove menu permissions',
        details: error
      }
    };
  }
};

export const bulkUpdateMenuPermissionsAction = async (menuId: string | number, permissionIds: (string | number)[], payload: IUpdateMenuPermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await menuPermissionBulkRepository.bulkUpdate(menuId, permissionIds, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log activity for successful updates
    for (const menuPermission of result.successful) {
      await menuPermissionActivityRepository.create({
        menuId: menuId,
        permissionId: menuPermission.permissionId,
        activityType: 'permission_updated',
        description: 'IMenu-permission relationship updated (bulk operation)',
        metadata: { bulk_operation: true, updated_fields: Object.keys(payload) }
      });
    }
    
    return { success: true, data: result };
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
        message: 'Failed to bulk update menu permissions',
        details: error
      }
    };
  }
};

// --- IMenu-IPermission Activity Actions ---------------------------------

export const createMenuPermissionActivityAction = async (activity: Omit<IMenuPermissionActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await menuPermissionActivityRepository.create(activity);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(activity.menuId));
    await revalidateCacheTag(accessControlTags.permission(activity.permissionId));
    
    return { success: true, data: createdActivity };
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
        message: 'Failed to create menu-permission activity',
        details: error
      }
    };
  }
};

// --- IMenu-IPermission Validation Actions ---------------------------------

export const validateMenuPermissionAction = async (request: IMenuPermissionValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await menuPermissionValidationRepository.validate(request);
    
    return { success: true, data: result };
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
        message: 'Failed to validate menu-permission relationship',
        details: error
      }
    };
  }
};

export const validateMenuPermissionTreeAction = async (menuId: string | number): Promise<ActionResultType<any>> => {
  try {
    const results = await menuPermissionValidationRepository.validateTree(menuId);
    
    // Log validation activity
    await menuPermissionActivityRepository.create({
      menuId: menuId,
      permissionId: 'system', // System activity
      activityType: 'other',
      description: 'IMenu permission tree validation performed',
      metadata: { 
        total_validations: results.length,
        valid_count: results.filter(r => r.is_valid).length,
        invalid_count: results.filter(r => !r.is_valid).length
      }
    });
    
    return { success: true, data: results };
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
        message: 'Failed to validate menu permission tree',
        details: error
      }
    };
  }
};

export const validateAllMenuPermissionsAction = async (): Promise<ActionResultType<any>> => {
  try {
    const results = await menuPermissionValidationRepository.validateAll();
    
    // Log validation activity
    await menuPermissionActivityRepository.create({
      menuId: 'system', // System activity
      permissionId: 'system',
      activityType: 'other',
      description: 'All menu-permission relationships validation performed',
      metadata: { 
        total_validations: results.length,
        valid_count: results.filter(r => r.is_valid).length,
        invalid_count: results.filter(r => !r.is_valid).length
      }
    });
    
    return { success: true, data: results };
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
        message: 'Failed to validate all menu-permission relationships',
        details: error
      }
    };
  }
};

// --- IMenu-IPermission Inheritance Actions ---------------------------------

export const calculateMenuPermissionInheritanceAction = async (menuId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await menuPermissionInheritanceRepository.calculateInheritance(menuId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log inheritance calculation activity
    await menuPermissionActivityRepository.create({
      menuId: menuId,
      permissionId: 'system',
      activityType: 'other',
      description: 'IMenu permission inheritance calculated',
      metadata: { 
        inherited_permissions_count: result.length
      }
    });
    
    return { success: true, data: result };
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
        message: 'Failed to calculate menu permission inheritance',
        details: error
      }
    };
  }
};

// --- IMenu-IPermission Conflict Actions ---------------------------------

export const resolveMenuPermissionConflictsAction = async (menuId: string | number, conflictIds: string[]): Promise<ActionResultType<any>> => {
  try {
    const result = await menuPermissionConflictRepository.resolveConflicts(menuId, conflictIds);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log conflict resolution activity
    await menuPermissionActivityRepository.create({
      menuId: menuId,
      permissionId: 'system',
      activityType: 'other',
      description: 'IMenu permission conflicts resolved',
      metadata: { 
        resolved_conflicts_count: result.resolution_count,
        unresolved_conflicts_count: result.unresolved_count
      }
    });
    
    return { success: true, data: result };
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
        message: 'Failed to resolve menu permission conflicts',
        details: error
      }
    };
  }
};

// --- IMenu-IPermission Export Actions ---------------------------------

export const exportMenuPermissionsAction = async (request: IMenuPermissionExportRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await menuPermissionExportRepository.export(request);
    
    // Log export activity
    await menuPermissionActivityRepository.create({
      menuId: 'system', // System activity
      permissionId: 'system',
      activityType: 'other',
      description: 'IMenu-permission data exported',
      metadata: { 
        format: request.format,
        // include_stats: request.include_stats,
        // include_activity: request.include_activity,
        file_name: result.file_name,
        record_count: result.record_count
      }
    });
    
    return { success: true, data: result };
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
        message: 'Failed to export menu-permission data',
        details: error
      }
    };
  }
};
