import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IMenuPermission, 
  ICreateMenuPermissionPayload, 
  IUpdateMenuPermissionPayload,
  IMenu,
  IPermission,
  IMenuPermissionStats,
  IMenuPermissionOverview,
  IBulkMenuPermissionPayload,
  IBulkMenuPermissionResponse,
  IMenuPermissionValidationResult,
  IMenuPermissionValidationRequest,
  IMenuPermissionActivity,
  IMenuPermissionActivityFilter,
  IMenuPermissionExportRequest,
  IMenuPermissionExportResponse,
  IMenuPermissionInheritance,
  IMenuPermissionInheritanceTree,
  IMenuPermissionConflict,
  IMenuPermissionConflictResolution
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

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

  // Get active permissions for menu
  getActivePermissions: (menuId: string | number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/menu-permissions/menu/${menuId}/active`, {
      revalidate: 120,
      tags: [accessControlTags.menu(menuId)],
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

// --- IMenu-IPermission Statistics Repository ---------------------------------

export const menuPermissionStatsRepository = {
  // Get menu-permission statistics
  getStats: (menuId: string | number, permissionId: string | number) => 
    serverFetch.get<IMenuPermissionStats>(`/api/access_control/menu-permissions/${menuId}/${permissionId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.menuPermission(menuId, permissionId)],
    }),

  // Get all menu-permission statistics
  getAllStats: () => 
    serverFetch.get<IMenuPermissionStats[]>('/api/access_control/menu-permissions/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.menuPermissions()],
    }),

  // Get menu-permission overview
  getOverview: (menuId: string | number, permissionId: string | number) => 
    serverFetch.get<IMenuPermissionOverview>(`/api/access_control/menu-permissions/${menuId}/${permissionId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.menuPermission(menuId, permissionId)],
    }),
} as const;

// --- IMenu-IPermission Bulk Operations Repository -----------------------------

export const menuPermissionBulkRepository = {
  // Bulk assign permissions to menu
  bulkAssign: (payload: IBulkMenuPermissionPayload) => 
    serverFetch.post<IBulkMenuPermissionResponse>('/api/access_control/menu-permissions/bulk-assign', payload, {
      revalidate: false,
    }),

  // Bulk remove permissions from menu
  bulkRemove: (menuId: string | number, permissionIds: (string | number)[]) => 
    serverFetch.post<IBulkMenuPermissionResponse>(`/api/access_control/menu-permissions/menu/${menuId}/bulk-remove`, { permission_ids: permissionIds }, {
      revalidate: false,
    }),

  // Bulk update menu-permission relationships
  bulkUpdate: (menuId: string | number, permissionIds: (string | number)[], payload: IUpdateMenuPermissionPayload) => 
    serverFetch.post<IBulkMenuPermissionResponse>(`/api/access_control/menu-permissions/menu/${menuId}/bulk-update`, { permission_ids: permissionIds, ...payload }, {
      revalidate: false,
    }),
} as const;

// --- IMenu-IPermission Validation Repository ---------------------------------

export const menuPermissionValidationRepository = {
  // Validate menu-permission relationship
  validate: (request: IMenuPermissionValidationRequest) => 
    serverFetch.post<IMenuPermissionValidationResult>('/api/access_control/menu-permissions/validate', request, {
      revalidate: false,
    }),

  // Validate menu permission tree
  validateTree: (menuId: string | number) => 
    serverFetch.post<Array<IMenuPermissionValidationResult>>(`/api/access_control/menu-permissions/menu/${menuId}/validate-tree`, {}, {
      revalidate: false,
    }),

  // Validate all menu-permission relationships
  validateAll: () => 
    serverFetch.post<Array<IMenuPermissionValidationResult>>('/api/access_control/menu-permissions/validate-all', {}, {
      revalidate: false,
    }),
} as const;

// --- IMenu-IPermission Activity Repository ---------------------------------

export const menuPermissionActivityRepository = {
  // List menu-permission activities
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IMenuPermissionActivity>>('/api/access_control/menu-permission-activities', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menuPermissions()],
    }),

  // Get activities by menu
  getByMenu: (menuId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IMenuPermissionActivity>>(`/api/access_control/menu-permission-activities/menu/${menuId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Get activities by permission
  getByPermission: (permissionId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IMenuPermissionActivity>>(`/api/access_control/menu-permission-activities/permission/${permissionId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.permission(permissionId)],
    }),

  // Create activity log
  create: (activity: Omit<IMenuPermissionActivity, 'id' | 'createdAt'>) => 
    serverFetch.post<IMenuPermissionActivity>('/api/access_control/menu-permission-activities', activity, {
      revalidate: false,
    }),

  // Get recent activities
  getRecent: (menuId: string | number, limit: number = 10) => 
    serverFetch.get<IMenuPermissionActivity[]>(`/api/access_control/menu-permission-activities/menu/${menuId}/recent`, {
      params: { limit },
      revalidate: 60,
      tags: [accessControlTags.menu(menuId)],
    }),
} as const;

// --- IMenu-IPermission Inheritance Repository -----------------------------

export const menuPermissionInheritanceRepository = {
  // Get inherited permissions for menu
  getInheritedPermissions: (menuId: string | number) => 
    serverFetch.get<IMenuPermissionInheritance[]>(`/api/access_control/menu-permissions/menu/${menuId}/inherited`, {
      revalidate: 120,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Get inheritance tree for menu
  getInheritanceTree: (menuId: string | number) => 
    serverFetch.get<IMenuPermissionInheritanceTree>(`/api/access_control/menu-permissions/menu/${menuId}/inheritance-tree`, {
      revalidate: 120,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Calculate inheritance for menu tree
  calculateInheritance: (menuId: string | number) => 
    serverFetch.post<Array<IMenuPermissionInheritance>>(`/api/access_control/menu-permissions/menu/${menuId}/calculate-inheritance`, {}, {
      revalidate: false,
    }),
} as const;

// --- IMenu-IPermission Conflict Repository ---------------------------------

export const menuPermissionConflictRepository = {
  // Detect conflicts for menu
  detectConflicts: (menuId: string | number) => 
    serverFetch.get<IMenuPermissionConflict[]>(`/api/access_control/menu-permissions/menu/${menuId}/conflicts`, {
      revalidate: 300,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Detect conflicts for all menus
  detectAllConflicts: () => 
    serverFetch.get<Array<{ menuId: string | number; conflicts: IMenuPermissionConflict[] }>>('/api/access_control/menu-permissions/conflicts/detect-all', {
      revalidate: 300,
      tags: [accessControlTags.menuPermissions()],
    }),

  // Resolve conflicts
  resolveConflicts: (menuId: string | number, conflictIds: string[]) => 
    serverFetch.post<IMenuPermissionConflictResolution>(`/api/access_control/menu-permissions/menu/${menuId}/resolve-conflicts`, { conflict_ids: conflictIds }, {
      revalidate: false,
    }),
} as const;

// --- IMenu-IPermission Export Repository ---------------------------------

export const menuPermissionExportRepository = {
  // Export menu-permission data
  export: (request: IMenuPermissionExportRequest) => 
    serverFetch.post<IMenuPermissionExportResponse>('/api/access_control/menu-permissions/export', request, {
      revalidate: false,
    }),

  // Get export history
  getExportHistory: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<any>>('/api/access_control/menu-permissions/export/history', {
      params,
      revalidate: 300,
      tags: [accessControlTags.menuPermissions()],
    }),
} as const;
