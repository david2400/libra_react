import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IPermission, 
  ICreatePermissionPayload, 
  IUpdatePermissionPayload,
  IMenu,
  IMenuPermission,
  ICreateMenuPermissionPayload,
  IUpdateMenuPermissionPayload,
  IRole,
  IRolePermission,
  ICreateRolePermissionPayload,
  IUpdateRolePermissionPayload,
  IUser,
  IUserPermission,
  ICreateUserPermissionPayload,
  IUpdateUserPermissionPayload
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Permissions Repository -----------------------------------------------------

export const permissionsRepository = {
  // List permissions
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IPermission>>('/api/access_control/permissions', {
      params,
      revalidate: 300,
      tags: [accessControlTags.permissions()],
    }),

  // Get permission by ID
  getById: (id: string | number) => 
    serverFetch.get<IPermission>(`/api/access_control/permissions/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.permission(id)],
    }),

  // Create permission
  create: (payload: ICreatePermissionPayload) => 
    serverFetch.post<IPermission>('/api/access_control/permissions', payload, {
      revalidate: false,
    }),

  // Update permission
  update: (id: string | number, payload: IUpdatePermissionPayload) => 
    serverFetch.put<IPermission>(`/api/access_control/permissions/${id}`, payload, {
      revalidate: false,
    }),

  // Delete permission
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/permissions/${id}`, {
      revalidate: false,
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
  create: (menuId: string | number, permissionId: string | number, payload: ICreateMenuPermissionPayload) => 
    serverFetch.post<IMenuPermission>(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Update menu-permission relationship
  update: (menuId: string | number, permissionId: string | number, payload: IUpdateMenuPermissionPayload) => 
    serverFetch.put<IMenuPermission>(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Delete menu-permission relationship
  delete: (menuId: string | number, permissionId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/menu-permissions/${menuId}/${permissionId}`, {
      revalidate: false,
    }),
} as const;

// --- IRole-IPermission Relationships Repository -----------------------------------

export const rolePermissionsRepository = {
  // List role-permissions
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRolePermission>>('/api/access_control/role-permissions', {
      params,
      revalidate: 120,
      tags: [accessControlTags.rolePermissions()],
    }),

  // Get role-permission by IDs
  getById: (roleId: string | number, permissionId: string | number) => 
    serverFetch.get<IRolePermission>(`/api/access_control/role-permissions/${roleId}/${permissionId}`, {
      revalidate: 300,
      tags: [accessControlTags.rolePermission(roleId, permissionId)],
    }),

  // Get permissions by role
  getPermissionsByRole: (roleId: string | number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/role-permissions/role/${roleId}`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Get roles by permission
  getRolesByPermission: (permissionId: string | number) => 
    serverFetch.get<IRole[]>(`/api/access_control/role-permissions/permission/${permissionId}`, {
      revalidate: 300,
      tags: [accessControlTags.permission(permissionId)],
    }),

  // Create role-permission relationship
  create: (roleId: string | number, permissionId: string | number, payload: ICreateRolePermissionPayload) => 
    serverFetch.post<IRolePermission>(`/api/access_control/role-permissions/${roleId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Update role-permission relationship
  update: (roleId: string | number, permissionId: string | number, payload: IUpdateRolePermissionPayload) => 
    serverFetch.put<IRolePermission>(`/api/access_control/role-permissions/${roleId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Delete role-permission relationship
  delete: (roleId: string | number, permissionId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/role-permissions/${roleId}/${permissionId}`, {
      revalidate: false,
    }),
} as const;

// --- IUser-IPermission Relationships Repository -----------------------------------

export const userPermissionsRepository = {
  // List user-permissions
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IUserPermission>>('/api/access_control/user-permissions', {
      params,
      revalidate: 120,
      tags: [accessControlTags.userPermissions()],
    }),

  // Get user-permission by IDs
  getById: (userId: string | number, permissionId: string | number) => 
    serverFetch.get<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, {
      revalidate: 300,
      tags: [accessControlTags.userPermission(userId, permissionId)],
    }),

  // Get permissions by user
  getPermissionsByUser: (userId: string | number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/user-permissions/user/${userId}`, {
      revalidate: 120,
      tags: [accessControlTags.user(userId)],
    }),

  // Get users by permission
  getUsersByPermission: (permissionId: string | number) => 
    serverFetch.get<IUser[]>(`/api/access_control/user-permissions/permission/${permissionId}`, {
      revalidate: 300,
      tags: [accessControlTags.permission(permissionId)],
    }),

  // Create user-permission relationship
  create: (userId: string | number, permissionId: string | number, payload: ICreateUserPermissionPayload) => 
    serverFetch.post<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Update user-permission relationship
  update: (userId: string | number, permissionId: string | number, payload: IUpdateUserPermissionPayload) => 
    serverFetch.put<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, payload, {
      revalidate: false,
    }),

  // Delete user-permission relationship
  delete: (userId: string | number, permissionId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/user-permissions/${userId}/${permissionId}`, {
      revalidate: false,
    }),
} as const;
