import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IApplication } from '../applications';
import { IModuleApplication } from '../modules_applications';
import { IRolePermission } from '../role_permissions';

// --- IPermission Types -------------------------------------------------------------

export interface IPermission {
  id_permission: number;
  name: string;
  description?: string;
  aplications_id: number;
  aplications?: IApplication;
  module_aplication_id?: number;
  module_aplication?: IModuleApplication;
  role_permission?: IRolePermission[];
  // Audit fields from AuditInfo
  created_at?: string;
  updated_at?: string;
}

export interface ICreatePermissionPayload {
  name: string;
  description?: string;
  aplications_id: number;
  module_aplication_id?: number;
}

export interface IUpdatePermissionPayload {
  name?: string;
  description?: string;
  aplications_id?: number;
  module_aplication_id?: number;
}
