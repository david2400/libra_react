import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IMenu-IPermission Relationship Types -------------------------------------

export interface IMenuPermission {
  menuId: string | number;
  permissionId: string | number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateMenuPermissionPayload {
  menuId: string | number;
  permissionId: string | number;
  isActive?: boolean;
}

export interface IUpdateMenuPermissionPayload {
  isActive?: boolean;
}

// --- IMenu Types (for menu-permission management) -----------------------------

export interface IMenu {
  id: string | number;
  name: string;
  label?: string;
  icon?: string;
  path?: string;
  parentId?: string | number;
  order?: number;
  isActive?: boolean;
  children?: IMenu[];
  permissions?: IPermission[];
  createdAt?: string;
  updatedAt?: string;
}

// --- IPermission Types (for menu-permission management) -------------------------

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

// --- IMenu-IPermission Statistics Types -------------------------------------

export interface IMenuPermissionStats {
  menuId: string | number;
  permissionId: string | number;
  usageCount: number;
  lastUsed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMenuPermissionOverview {
  menuPermission: IMenuPermission;
  menu: IMenu;
  permission: IPermission;
  stats: IMenuPermissionStats;
}

// --- Bulk Operations Types -------------------------------------------------

export interface IBulkMenuPermissionPayload {
  menuId: string | number;
  permissionIds: (string | number)[];
  isActive?: boolean;
}

export interface IBulkMenuPermissionResponse {
  successful: IMenuPermission[];
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

// --- IMenu-IPermission Validation Types -------------------------------------

export interface IMenuPermissionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  menuId: string | number;
  permissionId: string | number;
}

export interface IMenuPermissionValidationRequest {
  menuId: string | number;
  permissionId: string | number;
  validateCompatibility?: boolean;
  validateHierarchy?: boolean;
}

// --- IMenu-IPermission Activity Types -------------------------------------

export interface IMenuPermissionActivity {
  id: string | number;
  menuId: string | number;
  permissionId: string | number;
  activityType: 'permission_granted' | 'permission_revoked' | 'permission_updated' | 'permission_used' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IMenuPermissionActivityFilter {
  menuId?: string | number;
  permissionId?: string | number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

// --- IMenu-IPermission Export Types -------------------------------------

export interface IMenuPermissionExportRequest {
  menuIds?: (string | number)[];
  permissionIds?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  includeStats?: boolean;
  includeActivity?: boolean;
}

export interface IMenuPermissionExportResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  exportDate: string;
  recordCount: number;
}

// --- IMenu-IPermission Inheritance Types -------------------------------------

export interface IMenuPermissionInheritance {
  menuId: string | number;
  permissionId: string | number;
  inheritedFromMenuId?: string | number;
  inheritanceLevel: number;
  isActive?: boolean;
}

export interface IMenuPermissionInheritanceTree {
  menu: IMenu;
  inheritedPermissions: Array<{
    permission: IPermission;
    inheritedFrom: IMenu;
    inheritanceLevel: number;
  }>;
  totalInherited: number;
}

// --- IMenu-IPermission Conflict Types -------------------------------------

export interface IMenuPermissionConflict {
  menuId: string | number;
  permissionId: string | number;
  conflictType: 'duplicate' | 'incompatible' | 'hierarchy' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolutionSuggestion?: string;
}

export interface IMenuPermissionConflictResolution {
  conflicts: IMenuPermissionConflict[];
  resolutionCount: number;
  unresolvedCount: number;
}
