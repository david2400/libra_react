import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IMenu } from '../menus';

// --- MenuPermission Entity Types (Based on Java MenuPermissionEntity) -----------


export interface IMenuPermission extends IAuditInfo {
  id_menu_permission: number;
  menu_id: number;
  menu?: IMenu;
  role_id?: number;
  user_id?: number;
  expires_at?: Date;
  conditions?: string;
  cache_ttl?: number;
  create_permission?: boolean;
  update_permission?: boolean;
  delete_permission?: boolean;
  consult_permission?: boolean;
}

export interface ICreateMenuPermission {
  menu_id: number;
  role_id?: number;
  user_id?: number;
  expires_at?: Date;
  conditions?: string;
  cache_ttl?: number;
  create_permission?: boolean;
  update_permission?: boolean;
  delete_permission?: boolean;
  consult_permission?: boolean;
}

export interface IUpdateMenuPermission extends Partial<ICreateMenuPermission> {
  id_menu_permission: number;
}


export interface IMenuPermissionSearch {
  id_menu_permission?: number;
  menu_id?: number;
  role_id?: number;
  user_id?: number;
  expires_at?: Date;
  conditions?: string;
  cache_ttl?: number;
  is_expired?: boolean;
  priority?: number;
}

// --- MenuPermission Statistics Types ---------------------------------------

export interface IMenuPermissionStats {
  id_menu_permission: number;
  menu_id: number;
  usage_count: number;
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IMenuPermissionOverview {
  menu_permission: IMenuPermission;
  menu: IMenu;
  stats: IMenuPermissionStats;
}

// --- Bulk Operations Types -------------------------------------------------

export interface IBulkMenuPermissionPayload {
  menu_id: number;
  role_id?: number;
  user_id?: number;
  permissions: {
    create_permission?: boolean;
    update_permission?: boolean;
    delete_permission?: boolean;
    consult_permission?: boolean;
  };
  expires_at?: Date;
  conditions?: string;
  cache_ttl?: number;
}

export interface IBulkMenuPermissionResponse {
  successful: IMenuPermission[];
  failed: Array<{
    menu_id: number;
    role_id?: number;
    user_id?: number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// --- Bulk Save/Delete DTO (camelCase, matches Spring Boot MenuPermission DTO) --

/**
 * Single item for the POST /menu-permissions/bulk endpoint.
 * `idMenuPermission` null => create, value => update.
 * Exactly one of `roleId` / `userId` must be non-null.
 */
export interface IMenuPermissionBulkItem extends IAuditInfo {
  id_menu_permission: number | null;
  menu_id: number;
  role_id: number | null;
  user_id: number | null;
  create_permission: boolean;
  update_permission: boolean;
  delete_permission: boolean;
  consult_permission: boolean;
  // Optional / audit fields accepted by the service
  expires_at?: string | null;
  conditions?: string | null;
  cache_ttl?: number | null;
}

export interface IMenuPermissionBulkRequest {
  menu_permissions: IMenuPermissionBulkItem[];
}

// --- MenuPermission Validation Types -------------------------------------

export interface IMenuPermissionValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  menu_id: number;
  role_id?: number;
  user_id?: number;
}

export interface IMenuPermissionValidationRequest {
  menu_id: number;
  role_id?: number;
  user_id?: number;
  validate_compatibility?: boolean;
  validate_hierarchy?: boolean;
  validate_expiration?: boolean;
}

// --- MenuPermission Activity Types ---------------------------------------

export interface IMenuPermissionActivity {
  id: number;
  menu_id: number;
  role_id?: number;
  user_id?: number;
  activity_type: 'permission_granted' | 'permission_revoked' | 'permission_updated' | 'permission_used' | 'permission_expired' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface IMenuPermissionActivityFilter {
  menu_id?: number;
  role_id?: number;
  user_id?: number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}

// --- MenuPermission Export Types -------------------------------------------

export interface IMenuPermissionExportRequest {
  menu_ids?: number[];
  role_ids?: number[];
  user_ids?: number[];
  format?: 'json' | 'csv' | 'xlsx';
  include_stats?: boolean;
  include_activity?: boolean;
  include_expired?: boolean;
}

export interface IMenuPermissionExportResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  export_date: string;
  record_count: number;
}

// --- MenuPermission Inheritance Types -------------------------------------

export interface IMenuPermissionInheritance {
  menu_id: number;
  inherited_from_menu_id?: number;
  inheritance_level: number;
  role_id?: number;
  user_id?: number;
  is_active?: boolean;
}

export interface IMenuPermissionInheritanceTree {
  menu: IMenu;
  inherited_permissions: Array<{
    permission: IMenuPermission;
    inherited_from: IMenu;
    inheritance_level: number;
  }>;
  total_inherited: number;
}

// --- MenuPermission Conflict Types ---------------------------------------

export interface IMenuPermissionConflict {
  menu_id: number;
  role_id?: number;
  user_id?: number;
  conflict_type: 'duplicate' | 'priority_conflict' | 'expiration_conflict' | 'incompatible_permissions' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution_suggestion?: string;
  conflicting_permissions?: IMenuPermission[];
}

export interface IMenuPermissionConflictResolution {
  conflicts: IMenuPermissionConflict[];
  resolution_count: number;
  unresolved_count: number;
  resolved_permissions: IMenuPermission[];
}

// --- MenuPermission Priority Resolution Types -------------------------------

export interface IMenuPermissionPriority {
  menu_id: number;
  role_id?: number;
  user_id?: number;
  effective_permissions: {
    create_permission: boolean;
    update_permission: boolean;
    delete_permission: boolean;
    consult_permission: boolean;
  };
  priority_sources: Array<{
    role_id?: number;
    user_id?: number;
    priority: number;
    permissions: Partial<IMenuPermission>;
  }>;
}

// --- MenuPermission Resolution Types ---------------------------------------

export interface IMenuPermissionResolution {
  menu_id: number;
  target_role_id?: number;
  target_user_id?: number;
  resolved_permissions: IMenuPermission[];
  conflicts_resolved: number;
  inheritance_applied: boolean;
}
