import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IRoleMenu,
  ICreateRoleMenu,
  IUpdateRoleMenu,
  IRoleMenuStats,
  IRoleMenuOverview,
  IBulkRoleMenuPayload,
  IBulkRoleMenuResponse,
  IRoleMenuActivity,
  IRoleMenuActivityFilter,
  IRoleMenuValidationResult,
  IRoleMenuValidationRequest,
  IRoleMenuExportRequest,
  IRoleMenuExportResponse
} from './types';
import type { IRole } from '../../security/roles';
import type { IMenu } from '../menus';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IRole-IMenu Relationships Repository -------------------------------------

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

  // Get active menus for role
  getActiveMenus: (roleId: string | number) => 
    serverFetch.get<IMenu[]>(`/api/access_control/role-menus/role/${roleId}/active`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Create role-menu relationship
  create: (roleId: string | number, menuId: string | number, payload: ICreateRoleMenu) => 
    serverFetch.post<IRoleMenu>(`/api/access_control/role-menus/${roleId}/${menuId}`, payload, {
      revalidate: false,
    }),

  // Update role-menu relationship
  update: (roleId: string | number, menuId: string | number, payload: IUpdateRoleMenu) => 
    serverFetch.put<IRoleMenu>(`/api/access_control/role-menus/${roleId}/${menuId}`, payload, {
      revalidate: false,
    }),

  // Delete role-menu relationship
  delete: (roleId: string | number, menuId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/role-menus/${roleId}/${menuId}`, {
      revalidate: false,
    }),
} as const;

// --- IRole-IMenu Statistics Repository -----------------------------------------

export const roleMenuStatsRepository = {
  // Get role-menu statistics
  getStats: (roleId: string | number, menuId: string | number) => 
    serverFetch.get<IRoleMenuStats>(`/api/access_control/role-menus/${roleId}/${menuId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.roleMenu(roleId, menuId)],
    }),

  // Get all role-menu statistics
  getAllStats: () => 
    serverFetch.get<IRoleMenuStats[]>('/api/access_control/role-menus/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.roleMenus()],
    }),

  // Get role-menu overview
  getOverview: (roleId: string | number, menuId: string | number) => 
    serverFetch.get<IRoleMenuOverview>(`/api/access_control/role-menus/${roleId}/${menuId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.roleMenu(roleId, menuId)],
    }),
} as const;

// --- IRole-IMenu Bulk Operations Repository -------------------------------------

export const roleMenuBulkRepository = {
  // Bulk assign menus to role
  bulkAssign: (payload: IBulkRoleMenuPayload) => 
    serverFetch.post<IBulkRoleMenuResponse>('/api/access_control/role-menus/bulk-assign', payload, {
      revalidate: false,
    }),

  // Bulk remove menus from role
  bulkRemove: (roleId: string | number, menuIds: (string | number)[]) => 
    serverFetch.post<IBulkRoleMenuResponse>(`/api/access_control/role-menus/role/${roleId}/bulk-remove`, { menu_ids: menuIds }, {
      revalidate: false,
    }),

  // Bulk update role-menu relationships
  bulkUpdate: (roleId: string | number, menuIds: (string | number)[], payload: IUpdateRoleMenu) => 
    serverFetch.post<IBulkRoleMenuResponse>(`/api/access_control/role-menus/role/${roleId}/bulk-update`, { menu_ids: menuIds, ...payload }, {
      revalidate: false,
    }),
} as const;

// --- IRole-IMenu Tree Repository ---------------------------------------------

export const roleMenuTreeRepository = {
  // Get role menu tree
  getTree: (roleId: string | number) => 
    serverFetch.get<{ tree: any; total_nodes: number; max_depth: number }>(`/api/access_control/role-menus/role/${roleId}/tree`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Get flat role menu structure
  getFlat: (roleId: string | number) => 
    serverFetch.get<Array<{ menu: IMenu; role_menu: IRoleMenu; level: number; path: string[] }>>(`/api/access_control/role-menus/role/${roleId}/flat`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),
} as const;

// --- IRole-IMenu Activity Repository -----------------------------------------

export const roleMenuActivityRepository = {
  // List role-menu activities
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRoleMenuActivity>>('/api/access_control/role-menu-activities', {
      params,
      revalidate: 120,
      tags: [accessControlTags.roleMenus()],
    }),

  // Get activities by role
  getByRole: (roleId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRoleMenuActivity>>(`/api/access_control/role-menu-activities/role/${roleId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Get activities by menu
  getByMenu: (menuId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRoleMenuActivity>>(`/api/access_control/role-menu-activities/menu/${menuId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Create activity log
  create: (activity: Omit<IRoleMenuActivity, 'id' | 'created_at'>) => 
    serverFetch.post<IRoleMenuActivity>('/api/access_control/role-menu-activities', activity, {
      revalidate: false,
    }),

  // Get recent activities
  getRecent: (roleId: string | number, limit: number = 10) => 
    serverFetch.get<IRoleMenuActivity[]>(`/api/access_control/role-menu-activities/role/${roleId}/recent`, {
      params: { limit },
      revalidate: 60,
      tags: [accessControlTags.role(roleId)],
    }),
} as const;

// --- IRole-IMenu Validation Repository -----------------------------------------

export const roleMenuValidationRepository = {
  // Validate role-menu relationship
  validate: (request: IRoleMenuValidationRequest) => 
    serverFetch.post<IRoleMenuValidationResult>('/api/access_control/role-menus/validate', request, {
      revalidate: false,
    }),

  // Validate role menu tree
  validateTree: (roleId: string | number) => 
    serverFetch.post<Array<IRoleMenuValidationResult>>(`/api/access_control/role-menus/role/${roleId}/validate-tree`, {}, {
      revalidate: false,
    }),

  // Validate all role-menu relationships
  validateAll: () => 
    serverFetch.post<Array<IRoleMenuValidationResult>>('/api/access_control/role-menus/validate-all', {}, {
      revalidate: false,
    }),
} as const;

// --- IRole-IMenu Export Repository -----------------------------------------

export const roleMenuExportRepository = {
  // Export role-menu data
  export: (request: IRoleMenuExportRequest) => 
    serverFetch.post<IRoleMenuExportResponse>('/api/access_control/role-menus/export', request, {
      revalidate: false,
    }),

  // Get export history
  getExportHistory: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<any>>('/api/access_control/role-menus/export/history', {
      params,
      revalidate: 300,
      tags: [accessControlTags.roleMenus()],
    }),
} as const;
