import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IRole } from '../../security/roles';
import { IMenu } from '../menus';

// --- IRole-IMenu Relationship Types ----------------------------------------------

export interface IRoleMenu {
  role_id: number;
  menu_id: number;
  access_level: string;
  is_active: boolean;
  priority?: number;
  role?: IRole;
  menu?: IMenu;
  // Audit fields from AuditInfo
  created_at?: string;
  updated_at?: string;
}

export interface ICreateRoleMenuPayload {
  role_id: number;
  menu_id: number;
  access_level: string;
  is_active: boolean;
  priority?: number;
}

export interface IUpdateRoleMenuPayload {
  access_level?: string;
  is_active?: boolean;
  priority?: number;
}


// --- IRole-IMenu Statistics Types ------------------------------------------------

export interface IRoleMenuStats {
  role_id: number;
  menu_id: number;
  access_count: number;
  last_accessed?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IRoleMenuOverview {
  role_menu: IRoleMenu;
  role: IRole;
  menu: IMenu;
  stats: IRoleMenuStats;
}

// --- Bulk Operations Types -----------------------------------------------------

export interface IBulkRoleMenuPayload {
  role_id: number;
  menu_ids: number[];
  access_level: string;
  is_active: boolean;
  priority?: number;
}

export interface IBulkRoleMenuResponse {
  successful: IRoleMenu[];
  failed: Array<{
    menu_id: number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// --- IRole-IMenu Validation Types ------------------------------------------------

export interface IRoleMenuValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  role_id: string | number;
  menu_id: string | number;
}

export interface IRoleMenuValidationRequest {
  role_id: string | number;
  menu_id: string | number;
  validate_hierarchy?: boolean;
  validate_permissions?: boolean;
}

// --- IRole-IMenu Activity Types --------------------------------------------------

export interface IRoleMenuActivity {
  id: string | number;
  role_id: string | number;
  menu_id: string | number;
  activity_type: 'menu_granted' | 'menu_revoked' | 'menu_updated' | 'menu_accessed' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface IRoleMenuActivityFilter {
  role_id?: string | number;
  menu_id?: string | number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}

// --- IRole-IMenu Inheritance Types -----------------------------------------------

export interface IRoleMenuInheritance {
  role_id: string | number;
  menu_id: string | number;
  inherited_from_role_id?: string | number;
  inheritance_level: number;
  is_active?: boolean;
}

export interface IRoleMenuInheritanceTree {
  role: IRole;
  inherited_menus: Array<{
    menu: IMenu;
    inherited_from: IRole;
    inheritance_level: number;
  }>;
  total_inherited: number;
}

// --- IRole-IMenu Export Types ----------------------------------------------------

export interface IRoleMenuExportRequest {
  role_ids?: (string | number)[];
  menu_ids?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  include_stats?: boolean;
  include_activity?: boolean;
}

export interface IRoleMenuExportResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  export_date: string;
  record_count: number;
}
