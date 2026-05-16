import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IPermission } from '../../security/permissions';
import { IMenu } from '../menus';

// --- IMenu-IPermission Relationship Types -------------------------------------

export interface IMenuPermission extends IAuditInfo {
  menu_id: string | number;
  permission_id: string | number;
}

export interface ICreateMenuPermission {
  menu_id: string | number;
  permission_id: string | number;
}

export interface IUpdateMenuPermission extends ICreateMenuPermission {
}


// --- IMenu-IPermission Statistics Types -------------------------------------

export interface IMenuPermissionStats {
  menu_id: string | number;
  permission_id: string | number;
  usage_count: number;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IMenuPermissionOverview {
  menu_permission: IMenuPermission;
  menu: IMenu;
  permission: IPermission;
  stats: IMenuPermissionStats;
}

// --- Bulk Operations Types -------------------------------------------------

export interface IBulkMenuPermissionPayload {
  menu_id: string | number;
  permission_ids: (string | number)[];
  is_active?: boolean;
}

export interface IBulkMenuPermissionResponse {
  successful: IMenuPermission[];
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

// --- IMenu-IPermission Validation Types -------------------------------------

export interface IMenuPermissionValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  menu_id: string | number;
  permission_id: string | number;
}

export interface IMenuPermissionValidationRequest {
  menu_id: string | number;
  permission_id: string | number;
  validate_compatibility?: boolean;
  validate_hierarchy?: boolean;
}

// --- IMenu-IPermission Activity Types -------------------------------------

export interface IMenuPermissionActivity {
  id: string | number;
  menu_id: string | number;
  permission_id: string | number;
  activity_type: 'permission_granted' | 'permission_revoked' | 'permission_updated' | 'permission_used' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface IMenuPermissionActivityFilter {
  menu_id?: string | number;
  permission_id?: string | number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}

// --- IMenu-IPermission Export Types -------------------------------------

export interface IMenuPermissionExportRequest {
  menu_ids?: (string | number)[];
  permission_ids?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  include_stats?: boolean;
  include_activity?: boolean;
}

export interface IMenuPermissionExportResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  export_date: string;
  record_count: number;
}

// --- IMenu-IPermission Inheritance Types -------------------------------------

export interface IMenuPermissionInheritance {
  menu_id: string | number;
  permission_id: string | number;
  inherited_from_menu_id?: string | number;
  inheritance_level: number;
  is_active?: boolean;
}

export interface IMenuPermissionInheritanceTree {
  menu: IMenu;
  inherited_permissions: Array<{
    permission: IPermission;
    inherited_from: IMenu;
    inheritance_level: number;
  }>;
  total_inherited: number;
}

// --- IMenu-IPermission Conflict Types -------------------------------------

export interface IMenuPermissionConflict {
  menu_id: string | number;
  permission_id: string | number;
  conflict_type: 'duplicate' | 'incompatible' | 'hierarchy' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_suggestion?: string;
}

export interface IMenuPermissionConflictResolution {
  conflicts: IMenuPermissionConflict[];
  resolution_count: number;
  unresolved_count: number;
}
