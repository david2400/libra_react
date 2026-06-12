import 'server-only';
import { cache } from 'react';

import { 
  userMenusRepository, 
  userMenuBulkRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type {
  IUserMenu,
  IBulkUserMenuPayload,
  IBulkUserMenuResponse
} from './types';
import type { IMenu } from '../menus';
import type { IUser } from '../../account/users';

// --- IUser-IMenu Relationships Queries ---------------------------------

export const getUserMenus = cache((params?: ListParams) => 
  userMenusRepository.list(params)
);

export const getUserMenuById = cache((userId: string | number, menuId: string | number) => 
  userMenusRepository.getById(userId, menuId)
);

export const getMenusByUser = cache((userId: string | number) => 
  userMenusRepository.getMenusByUser(userId)
);

export const getActiveMenusByUser = cache((userId: string | number) => 
  userMenusRepository.getActiveMenusByUser(userId)
);

export const getUsersByMenu = cache((menuId: string | number) => 
  userMenusRepository.getUsersByMenu(menuId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get user with all menu relationships
export const getUserWithMenus = cache(async (userId: string | number) => {
  const [menus, activeMenus] = await Promise.all([
    getMenusByUser(userId),
    getActiveMenusByUser(userId)
  ]);
  
  return {
    user_id: userId,
    menus,
    active_menus: activeMenus,
    total_menus: menus.length,
    active_count: activeMenus.length
  };
});

// Get menu with all user relationships
export const getMenuWithUsers = cache(async (menuId: string | number) => {
  const users = await getUsersByMenu(menuId);
  
  return {
    menu_id: menuId,
    users,
    total_users: users.length
  };
});

// Get user menu dashboard data
export const getUserMenuDashboard = cache(async (userId: string | number) => {
  const [allMenus, activeMenus] = await Promise.all([
    getMenusByUser(userId),
    getActiveMenusByUser(userId)
  ]);
  
  // Calculate expiring soon (within 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const expiringSoon = allMenus.filter(menu => {
    if (!menu.expires_at) return false;
    const expiryDate = new Date(menu.expires_at);
    return expiryDate > now && expiryDate <= sevenDaysFromNow;
  });
  
  return {
    user_id: userId,
    menus: allMenus,
    active_menus: activeMenus,
    expiring_soon: expiringSoon,
    summary: {
      total_menus: allMenus.length,
      active_count: activeMenus.length,
      inactive_count: allMenus.length - activeMenus.length,
      expiring_soon_count: expiringSoon.length,
      with_override: allMenus.filter(m => m.override_role).length
    }
  };
});

// Get user menu access levels
export const getUserMenuAccessLevels = cache(async (userId: string | number) => {
  const menus = await getMenusByUser(userId);
  
  // Group by access level
  const byAccessLevel = menus.reduce((acc, menu) => {
    const level = menu.access_level || 'default';
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(menu);
    return acc;
  }, {} as Record<string, IUserMenu[]>);
  
  return {
    user_id: userId,
    by_access_level: byAccessLevel,
    access_levels: Object.keys(byAccessLevel),
    summary: Object.entries(byAccessLevel).map(([level, menus]) => ({
      access_level: level,
      count: menus.length
    }))
  };
});
