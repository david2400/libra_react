import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IPermission } from '../../security/permissions';
import { IApplication } from '../../security/applications';

export interface ICreateMenu {
  application_id: number;
  name: string;
  protocol?: string;
  subdomain?: string;
  url?: string;
  port?: number;
  path?: string;
  sort_order?: number;
  parent_id?: number;
  icon?: string;
  visible: boolean;
}

export interface IUpdateMenu extends ICreateMenu {
  id_menu: number;
}

export interface IMenu extends IAuditInfo, IUpdateMenu {
  parent?: IMenu;
  children?: IMenu[];
  application?: IApplication;
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
  menu_id: number;
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
  menu_id: number;
}

export interface IMenuValidationRequest {
  menu_id: number;
  validate_hierarchy?: boolean;
  validate_permissions?: boolean;
  validate_path?: boolean;
}

// --- IMenu Activity Types -------------------------------------------------------

export interface IMenuActivity {
  id: string | number;
  menu_id: number;
  user_id?: string | number;
  activity_type: 'view' | 'click' | 'created' | 'updated' | 'deleted' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface IMenuActivityFilter {
  menu_id?: number;
  user_id?: string | number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}

// --- IMenu Export Types ---------------------------------------------------------

export interface IMenuExportRequest {
  menu_ids?: number[];
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
  menu_id: number;
  new_order: number;
  new_parent_id?: number;
}

export interface IMenuReorderResponse {
  success: boolean;
  affected_menus: IMenu[];
  message?: string;
}
