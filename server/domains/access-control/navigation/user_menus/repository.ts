import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IUserMenu, 
  ICreateUserMenuPayload, 
  IUpdateUserMenuPayload,
  IMenu,
  IUser,
  IBulkUserMenuPayload,
  IBulkUserMenuResponse
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IUser-IMenu Relationships Repository ---------------------------------

export const userMenusRepository = {
  // List user-menus
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IUserMenu>>('/api/access_control/user-menus', {
      params,
      revalidate: 120,
      tags: [accessControlTags.userMenus()],
    }),

  // Get user-menu by IDs
  getById: (userId: string | number, menuId: string | number) => 
    serverFetch.get<IUserMenu>(`/api/access_control/user-menus/${userId}/${menuId}`, {
      revalidate: 300,
      tags: [accessControlTags.userMenu(userId, menuId)],
    }),

  // Get menus by user
  getMenusByUser: (userId: string | number) => 
    serverFetch.get<IUserMenu[]>(`/api/access_control/user-menus/user/${userId}`, {
      revalidate: 120,
      tags: [accessControlTags.user(userId)],
    }),

  // Get active menus by user
  getActiveMenusByUser: (userId: string | number) => 
    serverFetch.get<IUserMenu[]>(`/api/access_control/user-menus/user/${userId}/active`, {
      revalidate: 120,
      tags: [accessControlTags.user(userId)],
    }),

  // Get users by menu
  getUsersByMenu: (menuId: string | number) => 
    serverFetch.get<IUser[]>(`/api/access_control/user-menus/menu/${menuId}`, {
      revalidate: 300,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Create user-menu relationship
  create: (userId: string | number, menuId: string | number, payload: ICreateUserMenuPayload) => 
    serverFetch.post<IUserMenu>(`/api/access_control/user-menus`, payload, {
      revalidate: false,
    }),

  // Update user-menu relationship
  update: (userId: string | number, menuId: string | number, payload: IUpdateUserMenuPayload) => 
    serverFetch.put<IUserMenu>(`/api/access_control/user-menus/${userId}/${menuId}`, payload, {
      revalidate: false,
    }),

  // Delete user-menu relationship
  delete: (userId: string | number, menuId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/user-menus/${userId}/${menuId}`, {
      revalidate: false,
    }),
} as const;

// --- IUser-IMenu Bulk Operations Repository -----------------------------

export const userMenuBulkRepository = {
  // Bulk assign menus to user
  bulkAssign: (userId: string | number, payload: ICreateUserMenuPayload[]) => 
    serverFetch.post<IBulkUserMenuResponse>(`/api/access_control/user-menus/user/${userId}/bulk`, payload, {
      revalidate: false,
    }),

  // Bulk remove menus from user
  bulkRemove: (userId: string | number, menuIds: (string | number)[]) => 
    serverFetch.post<IBulkUserMenuResponse>(`/api/access_control/user-menus/user/${userId}/bulk-remove`, { menu_ids: menuIds }, {
      revalidate: false,
    }),

  // Bulk update user-menu relationships
  bulkUpdate: (userId: string | number, menuIds: (string | number)[], payload: IUpdateUserMenuPayload) => 
    serverFetch.post<IBulkUserMenuResponse>(`/api/access_control/user-menus/user/${userId}/bulk-update`, { menu_ids: menuIds, ...payload }, {
      revalidate: false,
    }),
} as const;
