'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  rolePermissionsRepository, 
  rolePermissionStatsRepository,
  rolePermissionBulkRepository,
  rolePermissionValidationRepository,
  rolePermissionActivityRepository,
  rolePermissionInheritanceRepository,
  rolePermissionConflictRepository,
  rolePermissionExportRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateRolePermissionPayload, 
  IUpdateRolePermissionPayload,
  IBulkRolePermissionPayload,
  IRolePermissionActivity,
  IRolePermissionValidationRequest,
  IRolePermissionExportRequest
} from './types';

// --- IRole-IPermission Relationships Actions ---------------------------------

export const createRolePermissionAction = async (roleId: string | number, permissionId: string | number, payload: ICreateRolePermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const rolePermission = await rolePermissionsRepository.create(roleId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.rolePermission(roleId, permissionId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.permission(permissionId));
    
    // Log activity
    await rolePermissionActivityRepository.create({
      roleId: roleId,
      permissionId: permissionId,
      activityType: 'permission_granted',
      description: 'IPermission granted to role',
      metadata: { isActive: payload.isActive }
    });
    
    return { success: true, data: rolePermission };
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
        message: 'Failed to create role-permission relationship',
        details: error
      }
    };
  }
};

export const updateRolePermissionAction = async (roleId: string | number, permissionId: string | number, payload: IUpdateRolePermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const rolePermission = await rolePermissionsRepository.update(roleId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.rolePermission(roleId, permissionId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity
    await rolePermissionActivityRepository.create({
      roleId: roleId,
      permissionId: permissionId,
      activityType: 'permission_updated',
      description: 'IRole-permission relationship updated',
      metadata: { updated_fields: Object.keys(payload) }
    });
    
    return { success: true, data: rolePermission };
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
        message: 'Failed to update role-permission relationship',
        details: error
      }
    };
  }
};

export const deleteRolePermissionAction = async (roleId: string | number, permissionId: string | number): Promise<ActionResultType<void>> => {
  try {
    await rolePermissionsRepository.delete(roleId, permissionId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.rolePermission(roleId, permissionId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.permission(permissionId));
    
    // Log activity
    await rolePermissionActivityRepository.create({
      roleId: roleId,
      permissionId: permissionId,
      activityType: 'permission_revoked',
      description: 'IPermission revoked from role'
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
        message: 'Failed to delete role-permission relationship',
        details: error
      }
    };
  }
};

// --- IRole-IPermission Bulk Operations Actions -----------------------------

export const bulkAssignRolePermissionsAction = async (payload: IBulkRolePermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await rolePermissionBulkRepository.bulkAssign(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.role(payload.roleId));
    
    // Log activity for successful assignments
    for (const rolePermission of result.successful) {
      await rolePermissionActivityRepository.create({
        roleId: payload.roleId,
        permissionId: rolePermission.permissionId,
        activityType: 'permission_granted',
        description: 'IPermission granted to role (bulk operation)',
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
        message: 'Failed to bulk assign role permissions',
        details: error
      }
    };
  }
};

export const bulkRemoveRolePermissionsAction = async (roleId: string | number, permissionIds: (string | number)[]): Promise<ActionResultType<any>> => {
  try {
    const result = await rolePermissionBulkRepository.bulkRemove(roleId, permissionIds);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity for successful removals
    for (const rolePermission of result.successful) {
      await rolePermissionActivityRepository.create({
        roleId: roleId,
        permissionId: rolePermission.permissionId,
        activityType: 'permission_revoked',
        description: 'IPermission revoked from role (bulk operation)',
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
        message: 'Failed to bulk remove role permissions',
        details: error
      }
    };
  }
};

export const bulkUpdateRolePermissionsAction = async (roleId: string | number, permissionIds: (string | number)[], payload: IUpdateRolePermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await rolePermissionBulkRepository.bulkUpdate(roleId, permissionIds, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity for successful updates
    for (const rolePermission of result.successful) {
      await rolePermissionActivityRepository.create({
        roleId: roleId,
        permissionId: rolePermission.permissionId,
        activityType: 'permission_updated',
        description: 'IRole-permission relationship updated (bulk operation)',
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
        message: 'Failed to bulk update role permissions',
        details: error
      }
    };
  }
};

// --- IRole-IPermission Activity Actions ---------------------------------

export const createRolePermissionActivityAction = async (activity: Omit<IRolePermissionActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await rolePermissionActivityRepository.create(activity);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.role(activity.roleId));
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
        message: 'Failed to create role-permission activity',
        details: error
      }
    };
  }
};

// --- IRole-IPermission Validation Actions ---------------------------------

export const validateRolePermissionAction = async (request: IRolePermissionValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await rolePermissionValidationRepository.validate(request);
    
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
        message: 'Failed to validate role-permission relationship',
        details: error
      }
    };
  }
};

export const validateRolePermissionTreeAction = async (roleId: string | number): Promise<ActionResultType<any>> => {
  try {
    const results = await rolePermissionValidationRepository.validate_tree(roleId);
    
    // Log validation activity
    await rolePermissionActivityRepository.create({
      roleId: roleId,
      permissionId: 'system', // System activity
      activityType: 'other',
      description: 'IRole permission tree validation performed',
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
        message: 'Failed to validate role permission tree',
        details: error
      }
    };
  }
};

export const validateAllRolePermissionsAction = async (): Promise<ActionResultType<any>> => {
  try {
    const results = await rolePermissionValidationRepository.validate_all();
    
    // Log validation activity
    await rolePermissionActivityRepository.create({
      roleId: 'system', // System activity
      permissionId: 'system',
      activityType: 'other',
      description: 'All role-permission relationships validation performed',
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
        message: 'Failed to validate all role-permission relationships',
        details: error
      }
    };
  }
};

// --- IRole-IPermission Inheritance Actions ---------------------------------

export const calculateRolePermissionInheritanceAction = async (roleId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await rolePermissionInheritanceRepository.calculate_inheritance(roleId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log inheritance calculation activity
    await rolePermissionActivityRepository.create({
      roleId: roleId,
      permissionId: 'system',
      activityType: 'other',
      description: 'IRole permission inheritance calculated',
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
        message: 'Failed to calculate role permission inheritance',
        details: error
      }
    };
  }
};

// --- IRole-IPermission Conflict Actions ---------------------------------

export const resolveRolePermissionConflictsAction = async (roleId: string | number, conflictIds: string[]): Promise<ActionResultType<any>> => {
  try {
    const result = await rolePermissionConflictRepository.resolve_conflicts(roleId, conflictIds);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log conflict resolution activity
    await rolePermissionActivityRepository.create({
      roleId: roleId,
      permissionId: 'system',
      activityType: 'other',
      description: 'IRole permission conflicts resolved',
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
        message: 'Failed to resolve role permission conflicts',
        details: error
      }
    };
  }
};

// --- IRole-IPermission Export Actions ---------------------------------

export const exportRolePermissionsAction = async (request: IRolePermissionExportRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await rolePermissionExportRepository.export(request);
    
    // Log export activity
    await rolePermissionActivityRepository.create({
      roleId: 'system', // System activity
      permissionId: 'system',
      activityType: 'other',
      description: 'IRole-permission data exported',
      metadata: { 
        format: request.format,
        include_stats: request.include_stats,
        include_activity: request.include_activity,
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
        message: 'Failed to export role-permission data',
        details: error
      }
    };
  }
};
