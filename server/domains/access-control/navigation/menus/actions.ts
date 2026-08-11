'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  menusRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateMenu, 
  IUpdateMenu,
  // ICreateMenuPermissionPayload,
  // IUpdateMenuPermissionPayload,
  // ICreateRoleMenuPayload,
  // IUpdateRoleMenuPayload,
  // ICreateUserMenuPayload,
  // IUpdateUserMenuPayload
} from './types';

// --- Menus Actions ---------------------------------------------------------

export const createMenuAction = async (payload: ICreateMenu): Promise<ActionResultType<any>> => {
  try {
    const menu = await menusRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menus());
    if (typeof menu.id_menu === 'string' || typeof menu.id_menu === 'number') {
      await revalidateCacheTag(accessControlTags.menu(menu.id_menu));
    }
    
    return { success: true, data: menu };
  } catch (error) {
    throw error;
  }
};

export const updateMenuAction = async (id: string | number, payload: IUpdateMenu): Promise<ActionResultType<any>> => {
  try {
    const menu = await menusRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.menus());
    await revalidateCacheTag(accessControlTags.menu(id));
    
    return { success: true, data: menu };
  } catch (error) {
    throw error;
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
    throw error;
  }
};


