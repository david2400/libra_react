import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IRole-IPermission Relationship Types ----------------------------------------

export interface IRolePermission {
  roleId: string | number;
  permissionId: string | number;
  isActive?: boolean;
  grantedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateRolePermissionPayload {
  roleId: string | number;
  permissionId: string | number;
  isActive?: boolean;
}

export interface IUpdateRolePermissionPayload {
  isActive?: boolean;
}

// --- IRole Types (for role-permission management) ------------------------------

export interface IRole {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: IPermission[];
  createdAt?: string;
  updatedAt?: string;
}

// --- IPermission Types (for role-permission management) ------------------------

export interface IPermission {
  id: string | number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- IRole-IPermission Statistics Types ------------------------------------------

export interface IRolePermissionStats {
  roleId: string | number;
  permissionId: string | number;
  usageCount: number;
  lastUsed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRolePermissionOverview {
  rolePermission: IRolePermission;
  role: IRole;
  permission: IPermission;
  stats: IRolePermissionStats;
}

// --- Bulk Operations Types -----------------------------------------------------

export interface IBulkRolePermissionPayload {
  roleId: string | number;
  permissionIds: (string | number)[];
  isActive?: boolean;
}

export interface IBulkRolePermissionResponse {
  successful: IRolePermission[];
  failed: Array<{
    permissionId: string | number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// --- IRole-IPermission Validation Types ------------------------------------------

export interface IRolePermissionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  roleId: string | number;
  permissionId: string | number;
}

export interface IRolePermissionValidationRequest {
  roleId: string | number;
  permissionId: string | number;
  validateConflicts?: boolean;
  validateHierarchy?: boolean;
}

// --- IRole-IPermission Activity Types --------------------------------------------

export interface IRolePermissionActivity {
  id: string | number;
  roleId: string | number;
  permissionId: string | number;
  activityType: 'permission_granted' | 'permission_revoked' | 'permission_updated' | 'permission_used' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IRolePermissionActivityFilter {
  roleId?: string | number;
  permissionId?: string | number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

// --- IRole-IPermission Inheritance Types -----------------------------------------

export interface IRolePermissionInheritance {
  roleId: string | number;
  permissionId: string | number;
  inheritedFromRoleId?: string | number;
  inheritanceLevel: number;
  isActive?: boolean;
}

export interface IRolePermissionInheritanceTree {
  role: IRole;
  inheritedPermissions: Array<{
    permission: IPermission;
    inheritedFrom: IRole;
    inheritanceLevel: number;
  }>;
  totalInherited: number;
}

// --- IRole-IPermission Conflict Types --------------------------------------------

export interface IRolePermissionConflict {
  roleId: string | number;
  permissionId: string | number;
  conflictType: 'duplicate' | 'incompatible' | 'hierarchy' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolutionSuggestion?: string;
}

export interface IRolePermissionConflictResolution {
  conflicts: IRolePermissionConflict[];
  resolutionCount: number;
  unresolvedCount: number;
}

// --- IRole-IPermission Export Types ----------------------------------------------

export interface IRolePermissionExportRequest {
  roleIds?: (string | number)[];
  permissionIds?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  includeStats?: boolean;
  includeActivity?: boolean;
}

export interface IRolePermissionExportResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  exportDate: string;
  recordCount: number;
}
