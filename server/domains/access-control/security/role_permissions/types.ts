import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IRole } from '../roles';
import { IPermission } from '../permissions';

// --- IRole-IPermission Relationship Types ----------------------------------------

export interface IRolePermission extends IAuditInfo {
  role_id: string | number;
  permission_id: string | number;
  level?: string;
}

export interface ICreateRolePermission {
  role_id: string | number;
  permission_id: string | number;
  level: string;
  is_active?: boolean;
}

export interface IUpdateRolePermission extends ICreateRolePermission {
}


// --- IRole-IPermission Statistics Types ------------------------------------------

export interface IRolePermissionStats {
  role_id: string | number;
  permission_id: string | number;
  usage_count: number;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IRolePermissionOverview {
  role_permission: IRolePermission;
  role: IRole;
  permission: IPermission;
  stats: IRolePermissionStats;
}

// --- Bulk Operations Types -----------------------------------------------------

export interface IBulkRolePermissionPayload {
  role_id: string | number;
  permission_ids: (string | number)[];

}

export interface IBulkRolePermissionResponse {
  successful: IRolePermission[];
  failed: Array<{
    permission_id: string | number;
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
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  role_id: string | number;
  permission_id: string | number;
}

export interface IRolePermissionValidationRequest {
  role_id: string | number;
  permission_id: string | number;
  validate_conflicts?: boolean;
  validate_hierarchy?: boolean;
}

// --- IRole-IPermission Activity Types --------------------------------------------

export interface IRolePermissionActivity {
  id: string | number;
  role_id: string | number;
  permission_id: string | number;
  activity_type: 'permission_granted' | 'permission_revoked' | 'permission_updated' | 'permission_used' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface IRolePermissionActivityFilter {
  role_id?: string | number;
  permission_id?: string | number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}

// --- IRole-IPermission Inheritance Types -----------------------------------------

export interface IRolePermissionInheritance {
  role_id: string | number;
  permission_id: string | number;
  inherited_from_role_id?: string | number;
  inheritance_level: number;

}

export interface IRolePermissionInheritanceTree {
  role: IRole;
  inherited_permissions: Array<{
    permission: IPermission;
    inherited_from: IRole;
    inheritance_level: number;
  }>;
  total_inherited: number;
}

// --- IRole-IPermission Conflict Types --------------------------------------------

export interface IRolePermissionConflict {
  role_id: string | number;
  permission_id: string | number;
  conflict_type: 'duplicate' | 'incompatible' | 'hierarchy' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_suggestion?: string;
}

export interface IRolePermissionConflictResolution {
  conflicts: IRolePermissionConflict[];
  resolution_count: number;
  unresolved_count: number;
}

// --- IRole-IPermission Export Types ----------------------------------------------

export interface IRolePermissionExportRequest {
  role_ids?: (string | number)[];
  permission_ids?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  include_stats?: boolean;
  include_activity?: boolean;
}

export interface IRolePermissionExportResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  export_date: string;
  record_count: number;
}
