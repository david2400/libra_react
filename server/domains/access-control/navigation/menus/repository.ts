import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ICreateMenuPayload, IUpdateMenuPayload } from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IMenu } from '@/modules/navigation/menus/models/menu.interface';
import { IUser } from '@/modules/account/users/models/user.interface';
import { IRoleMenu } from '@/modules/navigation/role-menus/models/role-menu.interface';
import { IMenuPermission, IPermission } from '@/modules/navigation/menu-permissions/models/menu-permission.interface';

// --- Menus Repository ---------------------------------------------------------

export const menusRepository = {
  // List menus
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IMenu>>('/api/access_control/menus', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get menu by ID
  getById: (id: string | number) => 
    serverFetch.get<IMenu>(`/api/access_control/menus/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.menu(id)],
    }),

  // Create menu
  create: (payload: ICreateMenuPayload) => 
    serverFetch.post<IMenu>('/api/access_control/menus', payload, {
      revalidate: false,
    }),

  // Update menu
  update: (id: string | number, payload: IUpdateMenuPayload) => 
    serverFetch.put<IMenu>(`/api/access_control/menus/${id}`, payload, {
      revalidate: false,
    }),

  // Delete menu
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/menus/${id}`, {
      revalidate: false,
    }),

  // Get menu tree
  getTree: (params?: ListParams) => 
    serverFetch.get<IMenuTreeResponse>('/api/access_control/menus/tree', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get flat menu structure
  getFlat: (params?: ListParams) => 
    serverFetch.get<FlatMenuResponse>('/api/access_control/menus/flat', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get root menus
  getRootMenus: () => 
    serverFetch.get<IMenu[]>('/api/access_control/menus/root', {
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get menu children
  getChildren: (parentId: string | number) => 
    serverFetch.get<IMenu[]>(`/api/access_control/menus/${parentId}/children`, {
      revalidate: 120,
      tags: [accessControlTags.menu(parentId)],
    }),

  // Get menu path
  getPath: (menuId: string | number) => 
    serverFetch.get<IMenu[]>(`/api/access_control/menus/${menuId}/path`, {
      revalidate: 300,
      tags: [accessControlTags.menu(menuId)],
    }),
} as const;

// --- IMenu-IPermission Relationships Repository ---------------------------------

export const menuPermissionsRepository = {
  // List menu-permissions
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IMenuPermission>>('/api/access_control/menu-permissions', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menuPermissions()],
    }),

  // Get menu-permission by IDs
  getById: (menuId: string | number, permissionId: string | number) => 
    serverFetch.get<IMenuPermission>(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, {
      revalidate: 300,
      tags: [accessControlTags.menuPermission(menuId, permissionId)],
    }),

  // Get permissions by menu
  getPermissionsByMenu: (menuId: string | number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/menu-permissions/menu/${menuId}`, {
      revalidate: 120,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Get menus by permission
  getMenusByPermission: (permissionId: string | number) => 
    serverFetch.get<IMenu[]>(`/api/access_control/menu-permissions/permission/${permissionId}`, {
      revalidate: 300,
      tags: [accessControlTags.permission(permissionId)],
    }),

  // Create menu-permission relationship
  create: (menuId: string | number, permissionId: string | number, payload: CreateMenuPermissionPayload) => 
    serverFetch.post<IMenuPermission>(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Update menu-permission relationship
  update: (menuId: string | number, permissionId: string | number, payload: UpdateMenuPermissionPayload) => 
    serverFetch.put<IMenuPermission>(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Delete menu-permission relationship
  delete: (menuId: string | number, permissionId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, {
      revalidate: false,
    }),
} as const;

// --- IRole-IMenu Relationships Repository -----------------------------------------

export const roleMenusRepository = {
  // List role-menus
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRoleMenu>>('/api/access_control/role-menus', {
      params,
      revalidate: 120,
      tags: [accessControlTags.roleMenus()],
    }),

  // Get role-menu by IDs
  getById: (roleId: string | number, menuId: string | number) => 
    serverFetch.get<IRoleMenu>(`/api/access_control/role-menus/${roleId}/${menuId}`, {
      revalidate: 300,
      tags: [accessControlTags.roleMenu(roleId, menuId)],
    }),

  // Get menus by role
  getMenusByRole: (roleId: string | number) => 
    serverFetch.get<IMenu[]>(`/api/access_control/role-menus/role/${roleId}`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Get roles by menu
  getRolesByMenu: (menuId: string | number) => 
    serverFetch.get<IRole[]>(`/api/access_control/role-menus/menu/${menuId}`, {
      revalidate: 300,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Create role-menu relationship
  create: (roleId: string | number, menuId: string | number, payload: CreateRoleMenuPayload) => 
    serverFetch.post<IRoleMenu>(`/api/access_control/role-menus/${roleId}/${menuId}`, payload, {
      revalidate: false,
    }),

  // Update role-menu relationship
  update: (roleId: string | number, menuId: string | number, payload: UpdateRoleMenuPayload) => 
    serverFetch.put<IRoleMenu>(`/api/access_control/role-menus/${roleId}/${menuId}`, payload, {
      revalidate: false,
    }),

  // Delete role-menu relationship
  delete: (roleId: string | number, menuId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/role-menus/${roleId}/${menuId}`, {
      revalidate: false,
    }),
} as const;

// --- IUser-IMenu Relationships Repository -----------------------------------------

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
    serverFetch.get<IMenu[]>(`/api/access_control/user-menus/user/${userId}`, {
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
    serverFetch.post<IUserMenu>(`/api/access_control/user-menus/${userId}/${menuId}`, payload, {
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
