'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  roleMenusRepository, 
  roleMenuStatsRepository,
  roleMenuBulkRepository,
  roleMenuTreeRepository,
  roleMenuActivityRepository,
  roleMenuValidationRepository,
  roleMenuExportRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateRoleMenuPayload, 
  IUpdateRoleMenuPayload,
  IBulkRoleMenuPayload,
  IRoleMenuActivity,
  IRoleMenuValidationRequest,
  IRoleMenuExportRequest
} from './types';

// --- IRole-IMenu Relationships Actions -----------------------------------------

export const createRoleMenuAction = async (roleId: string | number, menuId: string | number, payload: ICreateRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const roleMenu = await roleMenusRepository.create(roleId, menuId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.roleMenu(roleId, menuId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log activity
    await roleMenuActivityRepository.create({
      role_id: roleId,
      menu_id: menuId,
      activity_type: 'menu_granted',
      description: 'IMenu access granted to role',
      metadata: { is_active: payload.is_active }
    });
    
    return { success: true, data: roleMenu };
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
        message: 'Failed to create role-menu relationship',
        details: error
      }
    };
  }
};

export const updateRoleMenuAction = async (roleId: string | number, menuId: string | number, payload: IUpdateRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const roleMenu = await roleMenusRepository.update(roleId, menuId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.roleMenu(roleId, menuId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity
    await roleMenuActivityRepository.create({
      role_id: roleId,
      menu_id: menuId,
      activity_type: 'access_updated',
      description: 'IRole-menu access updated',
      metadata: { updated_fields: Object.keys(payload) }
    });
    
    return { success: true, data: roleMenu };
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
        message: 'Failed to update role-menu relationship',
        details: error
      }
    };
  }
};

export const deleteRoleMenuAction = async (roleId: string | number, menuId: string | number): Promise<ActionResultType<void>> => {
  try {
    await roleMenusRepository.delete(roleId, menuId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.roleMenu(roleId, menuId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log activity
    await roleMenuActivityRepository.create({
      role_id: roleId,
      menu_id: menuId,
      activity_type: 'menu_revoked',
      description: 'IMenu access revoked from role'
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
        message: 'Failed to delete role-menu relationship',
        details: error
      }
    };
  }
};

// --- IRole-IMenu Bulk Operations Actions -------------------------------------

export const bulkAssignRoleMenusAction = async (payload: IBulkRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await roleMenuBulkRepository.bulkAssign(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(payload.role_id));
    
    // Log activity for successful assignments
    for (const roleMenu of result.successful) {
      await roleMenuActivityRepository.create({
        role_id: payload.role_id,
        menu_id: roleMenu.menu_id,
        activity_type: 'menu_granted',
        description: 'IMenu access granted to role (bulk operation)',
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
        message: 'Failed to bulk assign role menus',
        details: error
      }
    };
  }
};

export const bulkRemoveRoleMenusAction = async (roleId: string | number, menuIds: (string | number)[]): Promise<ActionResultType<any>> => {
  try {
    const result = await roleMenuBulkRepository.bulkRemove(roleId, menuIds);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity for successful removals
    for (const roleMenu of result.successful) {
      await roleMenuActivityRepository.create({
        role_id: roleId,
        menu_id: roleMenu.menu_id,
        activity_type: 'menu_revoked',
        description: 'IMenu access revoked from role (bulk operation)',
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
        message: 'Failed to bulk remove role menus',
        details: error
      }
    };
  }
};

export const bulkUpdateRoleMenusAction = async (roleId: string | number, menuIds: (string | number)[], payload: IUpdateRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await roleMenuBulkRepository.bulkUpdate(roleId, menuIds, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity for successful updates
    for (const roleMenu of result.successful) {
      await roleMenuActivityRepository.create({
        role_id: roleId,
        menu_id: roleMenu.menu_id,
        activity_type: 'access_updated',
        description: 'IRole-menu access updated (bulk operation)',
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
        message: 'Failed to bulk update role menus',
        details: error
      }
    };
  }
};

// --- IRole-IMenu Activity Actions -----------------------------------------

export const createRoleMenuActivityAction = async (activity: Omit<IRoleMenuActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await roleMenuActivityRepository.create(activity);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(activity.role_id));
    if (activity.menu_id) {
      await revalidateCacheTag(accessControlTags.menu(activity.menu_id));
    }
    
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
        message: 'Failed to create role-menu activity',
        details: error
      }
    };
  }
};

// --- IRole-IMenu Validation Actions -----------------------------------------

export const validateRoleMenuAction = async (request: IRoleMenuValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await roleMenuValidationRepository.validate(request);
    
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
        message: 'Failed to validate role-menu relationship',
        details: error
      }
    };
  }
};

export const validateRoleMenuTreeAction = async (roleId: string | number): Promise<ActionResultType<any>> => {
  try {
    const results = await roleMenuValidationRepository.validateTree(roleId);
    
    // Log validation activity
    await roleMenuActivityRepository.create({
      role_id: roleId,
      activity_type: 'other',
      description: 'IRole menu tree validation performed',
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
        message: 'Failed to validate role menu tree',
        details: error
      }
    };
  }
};

export const validateAllRoleMenusAction = async (): Promise<ActionResultType<any>> => {
  try {
    const results = await roleMenuValidationRepository.validateAll();
    
    // Log validation activity
    await roleMenuActivityRepository.create({
      role_id: 'system', // System activity
      activity_type: 'other',
      description: 'All role-menu relationships validation performed',
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
        message: 'Failed to validate all role-menu relationships',
        details: error
      }
    };
  }
};

// --- IRole-IMenu Export Actions -----------------------------------------

export const exportRoleMenusAction = async (request: IRoleMenuExportRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await roleMenuExportRepository.export(request);
    
    // Log export activity
    await roleMenuActivityRepository.create({
      role_id: 'system', // System activity
      activity_type: 'other',
      description: 'IRole-menu data exported',
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
        message: 'Failed to export role-menu data',
        details: error
      }
    };
  }
};
