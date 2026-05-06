'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  menusRepository, 
  menuPermissionsRepository,
  roleMenusRepository,
  userMenusRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  CreateMenuPayload, 
  UpdateMenuPayload,
  CreateMenuPermissionPayload,
  UpdateMenuPermissionPayload,
  CreateRoleMenuPayload,
  UpdateRoleMenuPayload,
  CreateUserMenuPayload,
  UpdateUserMenuPayload
} from './types';

// --- Menus Actions ---------------------------------------------------------

export const createMenuAction = async (payload: CreateMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const menu = await menusRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menus());
    if (typeof menu.id === 'string' || typeof menu.id === 'number') {
      await revalidateCacheTag(accessControlTags.menu(menu.id));
    }
    
    return { success: true, data: menu };
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
        message: 'Failed to create menu',
        details: error
      }
    };
  }
};

export const updateMenuAction = async (id: string | number, payload: UpdateMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const menu = await menusRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menus());
    await revalidateCacheTag(accessControlTags.menu(id));
    
    return { success: true, data: menu };
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
        message: 'Failed to update menu',
        details: error
      }
    };
  }
};

export const deleteMenuAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await menusRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menus());
    await revalidateCacheTag(accessControlTags.menu(id));
    
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
        message: 'Failed to delete menu',
        details: error
      }
    };
  }
};

// --- IMenu-IPermission Relationships Actions ---------------------------------

export const createMenuPermissionAction = async (menuId: string | number, permissionId: string | number, payload: CreateMenuPermissionPayload): Promise<ActionResultType<any>> => {
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

export const updateMenuPermissionAction = async (menuId: string | number, permissionId: string | number, payload: UpdateMenuPermissionPayload): Promise<ActionResultType<any>> => {
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

// --- IRole-IMenu Relationships Actions -----------------------------------------

export const createRoleMenuAction = async (roleId: string | number, menuId: string | number, payload: CreateRoleMenuPayload): Promise<ActionResultType<any>> => {
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

export const updateRoleMenuAction = async (roleId: string | number, menuId: string | number, payload: UpdateRoleMenuPayload): Promise<ActionResultType<any>> => {
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

// --- IUser-IMenu Relationships Actions -----------------------------------------

export const createUserMenuAction = async (userId: string | number, menuId: string | number, payload: CreateUserMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const userMenu = await userMenusRepository.create(userId, menuId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userMenus());
    await revalidateCacheTag(accessControlTags.userMenu(userId, menuId));
    await revalidateCacheTag(accessControlTags.user(userId));
    await revalidateCacheTag(accessControlTags.menu(menuId));
    
    return { success: true, data: userMenu };
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
        message: 'Failed to create user-menu relationship',
        details: error
      }
    };
  }
};

export const updateUserMenuAction = async (userId: string | number, menuId: string | number, payload: UpdateUserMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const userMenu = await userMenusRepository.update(userId, menuId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userMenus());
    await revalidateCacheTag(accessControlTags.userMenu(userId, menuId));
    
    return { success: true, data: userMenu };
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
        message: 'Failed to update user-menu relationship',
        details: error
      }
    };
  }
};

export const deleteUserMenuAction = async (userId: string | number, menuId: string | number): Promise<ActionResultType<void>> => {
  try {
    await userMenusRepository.delete(userId, menuId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userMenus());
    await revalidateCacheTag(accessControlTags.userMenu(userId, menuId));
    
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
        message: 'Failed to delete user-menu relationship',
        details: error
      }
    };
  }
};
