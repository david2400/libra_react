import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IMenu Types ----------------------------------------------------------------

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

export interface ICreateMenuPayload {
  name: string;
  label?: string;
  icon?: string;
  path?: string;
  parentId?: string | number;
  order?: number;
}

export interface IUpdateMenuPayload {
  name?: string;
  label?: string;
  icon?: string;
  path?: string;
  parentId?: string | number;
  order?: number;
  isActive?: boolean;
}

// --- IPermission Types (for menu management) -----------------------------------

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

// --- IMenu Hierarchy Types ------------------------------------------------------

export interface IMenuHierarchy {
  menu: IMenu;
  parent?: IMenu;
  children: IMenu[];
  level: number;
  path: string[];
}

export interface IMenuTree {
  root: IMenu[];
  totalMenus: number;
  maxDepth: number;
}

// --- IMenu Statistics Types -----------------------------------------------------

export interface IMenuStats {
  menuId: string | number;
  viewCount: number;
  clickCount: number;
  lastAccessed?: string;
  averageAccessTime?: number;
  createdAt?: string;
  updatedAt?: string;
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
  isValid: boolean;
  errors: string[];
  warnings: string[];
  menuId: string | number;
}

export interface IMenuValidationRequest {
  menuId: string | number;
  validateHierarchy?: boolean;
  validatePermissions?: boolean;
  validatePath?: boolean;
}

// --- IMenu Activity Types -------------------------------------------------------

export interface IMenuActivity {
  id: string | number;
  menuId: string | number;
  userId?: string | number;
  activityType: 'view' | 'click' | 'created' | 'updated' | 'deleted' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IMenuActivityFilter {
  menuId?: string | number;
  userId?: string | number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

// --- IMenu Export Types ---------------------------------------------------------

export interface IMenuExportRequest {
  menuIds?: (string | number)[];
  format?: 'json' | 'csv' | 'xlsx';
  includeChildren?: boolean;
  includePermissions?: boolean;
  includeStats?: boolean;
}

export interface IMenuExportResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  exportDate: string;
  recordCount: number;
}

// --- IMenu Reordering Types -----------------------------------------------------

export interface IMenuReorderRequest {
  menuId: string | number;
  newOrder: number;
  newParentId?: string | number;
}

export interface IMenuReorderResponse {
  success: boolean;
  affectedMenus: IMenu[];
  message?: string;
}
