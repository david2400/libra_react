import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IPermission } from '../../security/permissions';

// --- IMenu Types ----------------------------------------------------------------

export interface IMenu {
  id: string | number;
  name: string;
  label?: string;
  icon?: string;
  path?: string;
  parent_id?: string | number;
  order?: number;
  is_active?: boolean;
  children?: IMenu[];
  permissions?: IPermission[];
  created_at?: string;
  updated_at?: string;
} 

export interface ICreateMenu {
  name: string;
  label?: string;
  icon?: string;
  path?: string;
  parent_id?: string | number;
  order?: number;
}

export interface IUpdateMenu {
  name?: string;
  label?: string;
  icon?: string;
  path?: string;
  parent_id?: string | number;
  order?: number;
  is_active?: boolean;
}

export interface IMenuHierarchy {
  menu: IMenu;
  parent?: IMenu;
  children: IMenu[];
  level: number;
  path: string[];
}

export interface IMenuTree {
  root: IMenu[];
  total_menus: number;
  max_depth: number;
}

// --- IMenu Statistics Types -----------------------------------------------------

export interface IMenuStats {
  menu_id: string | number;
  view_count: number;
  click_count: number;
  last_accessed?: string;
  average_access_time?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IMenuOverview {
  menu: IMenu;
  parent?: IMenu;
  children: IMenu[];
  permissions: IPermission[];
  stats: IMenuStats;
}

// --- IMenu Validation Types -----------------------------------------------------

export interface IMenuValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  menu_id: string | number;
}

export interface IMenuValidationRequest {
  menu_id: string | number;
  validate_hierarchy?: boolean;
  validate_permissions?: boolean;
  validate_path?: boolean;
}

// --- IMenu Activity Types -------------------------------------------------------

export interface IMenuActivity {
  id: string | number;
  menu_id: string | number;
  user_id?: string | number;
  activity_type: 'view' | 'click' | 'created' | 'updated' | 'deleted' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface IMenuActivityFilter {
  menu_id?: string | number;
  user_id?: string | number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}

// --- IMenu Export Types ---------------------------------------------------------

export interface IMenuExportRequest {
  menu_ids?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  include_children?: boolean;
  include_permissions?: boolean;
  include_stats?: boolean;
}

export interface IMenuExportResponse {
  file_url: string;
  file_name: string;
  file_size: number;
  export_date: string;
  record_count: number;
}

// --- IMenu Reordering Types -----------------------------------------------------

export interface IMenuReorderRequest {
  menu_id: string | number;
  new_order: number;
  new_parent_id?: string | number;
}

export interface IMenuReorderResponse {
  success: boolean;
  affected_menus: IMenu[];
  message?: string;
}
