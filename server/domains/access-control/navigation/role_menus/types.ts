import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IRole-IMenu Relationship Types ----------------------------------------------

export interface IRoleMenu {
  roleId: string | number;
  menuId: string | number;
  isActive?: boolean;
  canView?: boolean;
  canEdit?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateRoleMenuPayload {
  roleId: string | number;
  menuId: string | number;
  isActive?: boolean;
  canView?: boolean;
  canEdit?: boolean;
}

export interface IUpdateRoleMenuPayload {
  isActive?: boolean;
  canView?: boolean;
  canEdit?: boolean;
}

// --- IRole Types (for role-menu management) ------------------------------------

export interface IRole {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
  menus?: IMenu[];
  createdAt?: string;
  updatedAt?: string;
}

// --- IMenu Types (for role-menu management) ------------------------------------

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
  createdAt?: string;
  updatedAt?: string;
}

// --- IRole-IMenu Statistics Types ------------------------------------------------

export interface IRoleMenuStats {
  roleId: string | number;
  menuId: string | number;
  accessCount: number;
  lastAccessed?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRoleMenuOverview {
  roleMenu: IRoleMenu;
  role: IRole;
  menu: IMenu;
  stats: IRoleMenuStats;
}

// --- Bulk Operations Types -----------------------------------------------------

export interface IBulkRoleMenuPayload {
  roleId: string | number;
  menuIds: (string | number)[];
  isActive?: boolean;
  canView?: boolean;
  canEdit?: boolean;
}

export interface IBulkRoleMenuResponse {
  successful: IRoleMenu[];
  failed: Array<{
    menuId: string | number;
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
  isValid: boolean;
  errors: string[];
  warnings: string[];
  roleId: string | number;
  menuId: string | number;
}

export interface IRoleMenuValidationRequest {
  roleId: string | number;
  menuId: string | number;
  validateHierarchy?: boolean;
  validatePermissions?: boolean;
}

// --- IRole-IMenu Activity Types --------------------------------------------------

export interface IRoleMenuActivity {
  id: string | number;
  roleId: string | number;
  menuId: string | number;
  activityType: 'menu_granted' | 'menu_revoked' | 'menu_updated' | 'menu_accessed' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IRoleMenuActivityFilter {
  roleId?: string | number;
  menuId?: string | number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

// --- IRole-IMenu Inheritance Types -----------------------------------------------

export interface IRoleMenuInheritance {
  roleId: string | number;
  menuId: string | number;
  inheritedFromRoleId?: string | number;
  inheritanceLevel: number;
  isActive?: boolean;
}

export interface IRoleMenuInheritanceTree {
  role: IRole;
  inheritedMenus: Array<{
    menu: IMenu;
    inheritedFrom: IRole;
    inheritanceLevel: number;
  }>;
  totalInherited: number;
}

// --- IRole-IMenu Export Types ----------------------------------------------------

export interface IRoleMenuExportRequest {
  roleIds?: (string | number)[];
  menuIds?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  includeStats?: boolean;
  includeActivity?: boolean;
}

export interface IRoleMenuExportResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  exportDate: string;
  recordCount: number;
}
