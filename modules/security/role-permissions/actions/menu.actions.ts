'use server';

import { menusRepository } from '@/server/domains/access-control/navigation/menus/repository';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import { IMenu, IMenuSearch } from '@/server/domains/access-control/navigation/menus';

// --- Menus Actions -------------------------------------------------------------

export const listMenusAction = async (): Promise<IMenu[]> => {
  try {
    const response = await menusRepository.list();
    const menus = response || [];
    return menus;
  } catch (error) {
    throw error;
  }
};

export const listMenusByApplicationAction = async (params: IMenuSearch): Promise<any[]> => {
  try {
    // For now, we'll get all menus and filter by application_id
    // In a real implementation, you might have a specific endpoint for this
    const response = await menusRepository.getMenus(params);
    const allMenus = response || [];

    console.log('Loading menus for application:', params);
    console.log('Loading menus for application:', response);
    console.log('Loading menus for application:', allMenus);
    return allMenus;
  } catch (error) {
    throw error;
  }
};

export const getMenuTreeAction = async (): Promise<ActionResultType<any>> => {
  try {
    const response = await menusRepository.getTree();
    return { success: true, data: response };
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
        message: 'Failed to load menu tree',
        details: error
      }
    };
  }
};

export const getFlatMenusAction = async (): Promise<ActionResultType<any>> => {
  try {
    const response = await menusRepository.getFlat();
    return { success: true, data: response };
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
        message: 'Failed to load flat menus',
        details: error
      }
    };
  }
};
