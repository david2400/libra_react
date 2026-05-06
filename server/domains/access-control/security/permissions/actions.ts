'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  permissionsRepository, 
  menuPermissionsRepository,
  rolePermissionsRepository,
  userPermissionsRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreatePermissionPayload, 
  IUpdatePermissionPayload,
  ICreateMenuPermissionPayload,
  IUpdateMenuPermissionPayload,
  ICreateRolePermissionPayload,
  IUpdateRolePermissionPayload,
  ICreateUserPermissionPayload,
  IUpdateUserPermissionPayload
} from './types';

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

// --- IMenu-IPermission Relationships Actions ---------------------------------

export const createMenuPermissionAction = async (menuId: string | number, permissionId: string | number, payload: ICreateMenuPermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const menuPermission = await menuPermissionsRepository.create(menuId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menuPermissions());
    await revalidateCacheTag(accessControlTags.menuPermission(menuId, permissionId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    await revalidateCacheTag(accessControlTags.permission(permissionId));
    
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

// --- IUser-IPermission Relationships Actions -----------------------------------

export const createUserPermissionAction = async (userId: string | number, permissionId: string | number, payload: ICreateUserPermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const userPermission = await userPermissionsRepository.create(userId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userPermissions());
    await revalidateCacheTag(accessControlTags.userPermission(userId, permissionId));
    await revalidateCacheTag(accessControlTags.user(userId));
    await revalidateCacheTag(accessControlTags.permission(permissionId));
    
    return { success: true, data: userPermission };
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
        message: 'Failed to create user-permission relationship',
        details: error
      }
    };
  }
};

export const updateUserPermissionAction = async (userId: string | number, permissionId: string | number, payload: IUpdateUserPermissionPayload): Promise<ActionResultType<any>> => {
  try {
    const userPermission = await userPermissionsRepository.update(userId, permissionId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userPermissions());
    await revalidateCacheTag(accessControlTags.userPermission(userId, permissionId));
    
    return { success: true, data: userPermission };
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
        message: 'Failed to update user-permission relationship',
        details: error
      }
    };
  }
};

export const deleteUserPermissionAction = async (userId: string | number, permissionId: string | number): Promise<ActionResultType<void>> => {
  try {
    await userPermissionsRepository.delete(userId, permissionId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userPermissions());
    await revalidateCacheTag(accessControlTags.userPermission(userId, permissionId));
    
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
        message: 'Failed to delete user-permission relationship',
        details: error
      }
    };
  }
};
