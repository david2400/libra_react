import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IRolePermission, 
  ICreateRolePermissionPayload, 
  IUpdateRolePermissionPayload,
  IRole,
  IPermission,
  IRolePermissionStats,
  IRolePermissionOverview,
  IBulkRolePermissionPayload,
  IBulkRolePermissionResponse,
  IRolePermissionValidationResult,
  IRolePermissionValidationRequest,
  IRolePermissionActivity,
  IRolePermissionActivityFilter,
  IRolePermissionExportRequest,
  IRolePermissionExportResponse,
  IRolePermissionInheritance,
  IRolePermissionInheritanceTree,
  IRolePermissionConflict,
  IRolePermissionConflictResolution,
  // IRolePermissionMatrix,
  // IRolePermissionMatrixResponse
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IRole-IPermission Relationships Repository ---------------------------------

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

  // Get active permissions for role
  getActivePermissions: (roleId: string | number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/role-permissions/role/${roleId}/active`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
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

// --- IRole-IPermission Statistics Repository ---------------------------------

export const rolePermissionStatsRepository = {
  // Get role-permission statistics
  getStats: (roleId: string | number, permissionId: string | number) => 
    serverFetch.get<IRolePermissionStats>(`/api/access_control/role-permissions/${roleId}/${permissionId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.rolePermission(roleId, permissionId)],
    }),

  // Get all role-permission statistics
  getAllStats: () => 
    serverFetch.get<IRolePermissionStats[]>('/api/access_control/role-permissions/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.rolePermissions()],
    }),

  // Get role-permission overview
  getOverview: (roleId: string | number, permissionId: string | number) => 
    serverFetch.get<IRolePermissionOverview>(`/api/access_control/role-permissions/${roleId}/${permissionId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.rolePermission(roleId, permissionId)],
    }),
} as const;

// --- IRole-IPermission Bulk Operations Repository -----------------------------

export const rolePermissionBulkRepository = {
  // Bulk assign permissions to role
  bulkAssign: (payload: IBulkRolePermissionPayload) => 
    serverFetch.post<IBulkRolePermissionResponse>('/api/access_control/role-permissions/bulk-assign', payload, {
      revalidate: false,
    }),

  // Bulk remove permissions from role
  bulkRemove: (roleId: string | number, permissionIds: (string | number)[]) => 
    serverFetch.post<IBulkRolePermissionResponse>(`/api/access_control/role-permissions/role/${roleId}/bulk-remove`, { permission_ids: permissionIds }, {
      revalidate: false,
    }),

  // Bulk update role-permission relationships
  bulkUpdate: (roleId: string | number, permissionIds: (string | number)[], payload: IUpdateRolePermissionPayload) => 
    serverFetch.post<IBulkRolePermissionResponse>(`/api/access_control/role-permissions/role/${roleId}/bulk-update`, { permission_ids: permissionIds, ...payload }, {
      revalidate: false,
    }),
} as const;

// --- IRole-IPermission Validation Repository ---------------------------------

export const rolePermissionValidationRepository = {
  // Validate role-permission relationship
  validate: (request: IRolePermissionValidationRequest) => 
    serverFetch.post<IRolePermissionValidationResult>('/api/access_control/role-permissions/validate', request, {
      revalidate: false,
    }),

  // Validate role permission tree
  validate_tree: (roleId: string | number) => 
    serverFetch.post<Array<IRolePermissionValidationResult>>(`/api/access_control/role-permissions/role/${roleId}/validate-tree`, {}, {
      revalidate: false,
    }),

  // Validate all role-permission relationships
  validate_all: () => 
    serverFetch.post<Array<IRolePermissionValidationResult>>('/api/access_control/role-permissions/validate-all', {}, {
      revalidate: false,
    }),
} as const;

// --- IRole-IPermission Activity Repository ---------------------------------

export const rolePermissionActivityRepository = {
  // List role-permission activities
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRolePermissionActivity>>('/api/access_control/role-permission-activities', {
      params,
      revalidate: 120,
      tags: [accessControlTags.rolePermissions()],
    }),

  // Get activities by role
  get_by_role: (roleId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRolePermissionActivity>>(`/api/access_control/role-permission-activities/role/${roleId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Get activities by permission
  get_by_permission: (permissionId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IRolePermissionActivity>>(`/api/access_control/role-permission-activities/permission/${permissionId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.permission(permissionId)],
    }),

  // Create activity log
  create: (activity: Omit<IRolePermissionActivity, 'id' | 'createdAt'>) => 
    serverFetch.post<IRolePermissionActivity>('/api/access_control/role-permission-activities', activity, {
      revalidate: false,
    }),

  // Get recent activities
  getRecent: (roleId: string | number, limit: number = 10) => 
    serverFetch.get<IRolePermissionActivity[]>(`/api/access_control/role-permission-activities/role/${roleId}/recent`, {
      params: { limit },
      revalidate: 60,
      tags: [accessControlTags.role(roleId)],
    }),
} as const;

// --- IRole-IPermission Inheritance Repository -----------------------------

export const rolePermissionInheritanceRepository = {
  // Get inherited permissions for role
  get_inherited_permissions: (roleId: string | number) => 
    serverFetch.get<IRolePermissionInheritance[]>(`/api/access_control/role-permissions/role/${roleId}/inherited`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Get inheritance tree for role
  get_inheritance_tree: (roleId: string | number) => 
    serverFetch.get<IRolePermissionInheritanceTree>(`/api/access_control/role-permissions/role/${roleId}/inheritance-tree`, {
      revalidate: 120,
      tags: [accessControlTags.role(roleId)],
    }),

  // Calculate inheritance for role tree
  calculate_inheritance: (roleId: string | number) => 
    serverFetch.post<Array<IRolePermissionInheritance>>(`/api/access_control/role-permissions/role/${roleId}/calculate-inheritance`, {}, {
      revalidate: false,
    }),
} as const;

// --- IRole-IPermission Conflict Repository ---------------------------------

export const rolePermissionConflictRepository = {
  // Detect conflicts for role
  detect_conflicts: (roleId: string | number) => 
    serverFetch.get<IRolePermissionConflict[]>(`/api/access_control/role-permissions/role/${roleId}/conflicts`, {
      revalidate: 300,
      tags: [accessControlTags.role(roleId)],
    }),

  // Detect conflicts for all roles
  detect_all_conflicts: () => 
    serverFetch.get<Array<{ roleId: string | number; conflicts: IRolePermissionConflict[] }>>('/api/access_control/role-permissions/conflicts/detect-all', {
      revalidate: 300,
      tags: [accessControlTags.rolePermissions()],
    }),

  // Resolve conflicts
  resolve_conflicts: (roleId: string | number, conflictIds: string[]) => 
    serverFetch.post<IRolePermissionConflictResolution>(`/api/access_control/role-permissions/role/${roleId}/resolve-conflicts`, { conflict_ids: conflictIds }, {
      revalidate: false,
    }),
} as const;

// --- IRole-IPermission Matrix Repository ---------------------------------

// export const role_permission_matrix_repository = {
//   // Get role-permission matrix
//   get_matrix: (params?: ListParams) => 
//     serverFetch.get<IRolePermissionMatrixResponse>('/api/access_control/role-permissions/matrix', {
//       params,
//       revalidate: 120,
//       tags: [accessControlTags.rolePermissions()],
//     }),

//   // Get matrix by role
//   get_matrix_by_role: (roleId: string | number) => 
//     serverFetch.get<IRolePermissionMatrix[]>(`/api/access_control/role-permissions/role/${roleId}/matrix`, {
//       revalidate: 120,
//       tags: [accessControlTags.role(roleId)],
//     }),

//   // Get matrix by permission
//   get_matrix_by_permission: (permissionId: string | number) => 
//     serverFetch.get<IRolePermissionMatrix[]>(`/api/access_control/role-permissions/permission/${permissionId}/matrix`, {
//       revalidate: 300,
//       tags: [accessControlTags.permission(permissionId)],
//     }),
// } as const;

// --- IRole-IPermission Export Repository ---------------------------------

export const rolePermissionExportRepository = {
  // Export role-permission data
  export: (request: IRolePermissionExportRequest) => 
    serverFetch.post<IRolePermissionExportResponse>('/api/access_control/role-permissions/export', request, {
      revalidate: false,
    }),

  // Get export history
  get_export_history: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<any>>('/api/access_control/role-permissions/export/history', {
      params,
      revalidate: 300,
      tags: [accessControlTags.rolePermissions()],
    }),
} as const;
