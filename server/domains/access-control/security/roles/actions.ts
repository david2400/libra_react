'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  rolesRepository, 
  roleMenusRepository,
  rolePermissionsRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateRolePayload, 
  IUpdateRolePayload,
  ICreateRoleMenuPayload,
  IUpdateRoleMenuPayload,
  ICreateRolePermissionPayload,
  IUpdateRolePermissionPayload,
  IBulkRoleMenuPayload
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

// --- IRole-IMenu Relationships Actions -----------------------------------------

export const createRoleMenuAction = async (roleId: string | number, menuId: string | number, payload: ICreateRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const roleMenu = await roleMenusRepository.create(roleId, menuId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.roleMenu(roleId, menuId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
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

export const bulkAssignRoleMenusAction = async (payload: IBulkRoleMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const roleMenus = await roleMenusRepository.bulkAssign(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.roleMenus());
    await revalidateCacheTag(accessControlTags.role(payload.roleId));
    
    return { success: true, data: roleMenus };
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

// --- IRole-IPermission Relationships Actions -----------------------------------

export const createRolePermissionAction = async (roleId: string | number, permissionId: string | number, payload: ICreateRolePermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const rolePermission = await rolePermissionsRepository.create(roleId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.rolePermissions());
    await revalidateCacheTag(accessControlTags.rolePermission(roleId, permissionId));
    await revalidateCacheTag(accessControlTags.role(roleId));
    await revalidateCacheTag(accessControlTags.permission(permissionId));
    
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
