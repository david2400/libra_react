'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  userMenusRepository, 
  userMenuBulkRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateUserMenuPayload, 
  IUpdateUserMenuPayload,
  IBulkUserMenuPayload
} from './types';

// --- IUser-IMenu Relationships Actions ---------------------------------

export const createUserMenuAction = async (userId: string | number, menuId: string | number, payload: ICreateUserMenuPayload): Promise<ActionResultType<any>> => {
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

export const updateUserMenuAction = async (userId: string | number, menuId: string | number, payload: IUpdateUserMenuPayload): Promise<ActionResultType<any>> => {
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

// --- IUser-IMenu Bulk Operations Actions -----------------------------

export const bulkAssignUserMenusAction = async (userId: string | number, payload: ICreateUserMenuPayload[]): Promise<ActionResultType<any>> => {
  try {
    const result = await userMenuBulkRepository.bulkAssign(userId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userMenus());
    await revalidateCacheTag(accessControlTags.user(userId));
    
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
        message: 'Failed to bulk assign user menus',
        details: error
      }
    };
  }
};

export const bulkRemoveUserMenusAction = async (userId: string | number, menuIds: (string | number)[]): Promise<ActionResultType<any>> => {
  try {
    const result = await userMenuBulkRepository.bulkRemove(userId, menuIds);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userMenus());
    await revalidateCacheTag(accessControlTags.user(userId));
    
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
        message: 'Failed to bulk remove user menus',
        details: error
      }
    };
  }
};

export const bulkUpdateUserMenusAction = async (userId: string | number, menuIds: (string | number)[], payload: IUpdateUserMenuPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await userMenuBulkRepository.bulkUpdate(userId, menuIds, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userMenus());
    await revalidateCacheTag(accessControlTags.user(userId));
    
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
        message: 'Failed to bulk update user menus',
        details: error
      }
    };
  }
};
