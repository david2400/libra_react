'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  roleMenusRepository, 
  role_menu_stats_repository,
  role_menu_bulk_repository,
  role_menu_tree_repository,
  role_menu_activity_repository,
  role_menu_validation_repository,
  role_menu_export_repository
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

export const create_role_menu_action = async (roleId: string | number, menuId: string | number, payload: CreateRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const roleMenu = await roleMenusRepository.create(roleId, menuId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.roleMenu(roleId, menuId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log activity
    await role_menu_activity_repository.create({
      roleId: roleId,
      menuId: menuId,
      activityType: 'access_granted',
      description: 'IMenu access granted to role',
      metadata: { isActive: payload.isActive }
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

export const update_role_menu_action = async (roleId: string | number, menuId: string | number, payload: IUpdateRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const roleMenu = await roleMenusRepository.update(roleId, menuId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.roleMenu(roleId, menuId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity
    await role_menu_activity_repository.create({
      roleId: roleId,
      menuId: menuId,
      activityType: 'access_updated',
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

export const delete_role_menu_action = async (roleId: string | number, menuId: string | number): Promise<ActionResultType<void>> => {
  try {
    await roleMenusRepository.delete(roleId, menuId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.roleMenu(roleId, menuId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    // Log activity
    await role_menu_activity_repository.create({
      roleId: roleId,
      menuId: menuId,
      activityType: 'access_revoked',
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

export const bulk_assign_role_menus_action = async (payload: IBulkRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await role_menu_bulk_repository.bulk_assign(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(payload.roleId));
    
    // Log activity for successful assignments
    for (const roleMenu of result.successful) {
      await role_menu_activity_repository.create({
        roleId: payload.roleId,
        menuId: roleMenu.menuId,
        activityType: 'access_granted',
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

export const bulk_remove_role_menus_action = async (roleId: string | number, menuIds: (string | number)[]): Promise<ActionResultType<any>> => {
  try {
    const result = await role_menu_bulk_repository.bulk_remove(roleId, menuIds);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity for successful removals
    for (const roleMenu of result.successful) {
      await role_menu_activity_repository.create({
        roleId: roleId,
        menuId: roleMenu.menuId,
        activityType: 'access_revoked',
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

export const bulk_update_role_menus_action = async (roleId: string | number, menuIds: (string | number)[], payload: UpdateRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await role_menu_bulk_repository.bulk_update(roleId, menuIds, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(roleId));
    
    // Log activity for successful updates
    for (const roleMenu of result.successful) {
      await role_menu_activity_repository.create({
        roleId: roleId,
        menuId: roleMenu.menuId,
        activityType: 'access_updated',
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

export const create_role_menu_activity_action = async (activity: Omit<IRoleMenuActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await role_menu_activity_repository.create(activity);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(activity.roleId));
    if (activity.menuId) {
      await revalidateCacheTag(accessControlTags.menu(activity.menuId));
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

export const validate_role_menu_action = async (request: IRoleMenuValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await role_menu_validation_repository.validate(request);
    
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

export const validate_role_menu_tree_action = async (roleId: string | number): Promise<ActionResultType<any>> => {
  try {
    const results = await role_menu_validation_repository.validate_tree(roleId);
    
    // Log validation activity
    await role_menu_activity_repository.create({
      roleId: roleId,
      activityType: 'other',
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

export const validate_all_role_menus_action = async (): Promise<ActionResultType<any>> => {
  try {
    const results = await role_menu_validation_repository.validate_all();
    
    // Log validation activity
    await role_menu_activity_repository.create({
      roleId: 'system', // System activity
      activityType: 'other',
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

export const export_role_menus_action = async (request: IRoleMenuExportRequest): Promise<ActionResultType<any>> => {
  try {
    const result = await role_menu_export_repository.export(request);
    
    // Log export activity
    await role_menu_activity_repository.create({
      roleId: 'system', // System activity
      activityType: 'other',
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
