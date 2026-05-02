import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IRole, 
  ICreateRolePayload, 
  IUpdateRolePayload,
  IPermission,
  IMenu,
  IRoleMenu,
  ICreateRoleMenuPayload,
  IUpdateRoleMenuPayload,
  IRolePermission,
  ICreateRolePermissionPayload,
  IUpdateRolePermissionPayload,
  IBulkRoleMenuPayload
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Roles Repository ---------------------------------------------------------

export const rolesRepository = {
  // List roles
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRole>>('/api/access_control/roles', {
      params,
      revalidate: 120,
      tags: [accessControlTags.roles()],
    }),

  // Get role by ID
  getById: (id: string | number) => 
    serverFetch.get<IRole>(`/api/access_control/roles/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.role(id)],
    }),

  // Create role
  create: (payload: ICreateRolePayload) => 
    serverFetch.post<IRole>('/api/access_control/roles', payload, {
      revalidate: false,
    }),

  // Update role
  update: (id: string | number, payload: IUpdateRolePayload) => 
    serverFetch.put<IRole>(`/api/access_control/roles/${id}`, payload, {
      revalidate: false,
    }),

  // Delete role
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/roles/${id}`, {
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

  // Get role by menu
  getRoleByMenu: (menuId: string | number) => 
    serverFetch.get<IRole>(`/api/access_control/role-menus/menu/${menuId}`, {
      revalidate: 300,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Create role-menu relationship
  create: (roleId: string | number, menuId: string | number, payload: ICreateRoleMenuPayload) => 
    serverFetch.post<IRoleMenu>(`/api/access_control/role-menus/${roleId}/${menuId}`, payload, {
      revalidate: false,
    }),

  // Update role-menu relationship
  update: (roleId: string | number, menuId: string | number, payload: IUpdateRoleMenuPayload) => 
    serverFetch.put<IRoleMenu>(`/api/access_control/role-menus/${roleId}/${menuId}`, payload, {
      revalidate: false,
    }),

  // Delete role-menu relationship
  delete: (roleId: string | number, menuId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/role-menus/${roleId}/${menuId}`, {
      revalidate: false,
    }),

  // Bulk assign menus to role
  bulkAssign: (payload: IBulkRoleMenuPayload) => 
    serverFetch.post<IRoleMenu[]>('/api/access_control/role-menus/role/{roleId}/bulk', payload, {
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

  // Get role by permission
  getRoleByPermission: (permissionId: string | number) => 
    serverFetch.get<IRole>(`/api/access_control/role-permissions/permission/${permissionId}`, {
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
