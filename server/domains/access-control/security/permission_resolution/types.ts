import 'server-only';
import type { ListParams } from '@/server/lib/types';

// --- IPermission Resolution Types ---------------------------------------------

export interface IPermission {
  id_permission: number;
  name: string;
  description?: string;
  aplications_id: number;
  module_aplication_id?: number;
  activo?: boolean;
  usr_crea?: number;
  usr_mod?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IEffectivePermission extends IPermission {
  source: 'USER' | 'ROLE';
  level?: string;
  role_id?: number;
  role_name?: string;
}

export interface IPermissionCheckRequest {
  permission_code: string;
  required_level: string;
}

export interface IPermissionCheckResponse {
  has_permission: boolean;
  effective_level?: string;
  source?: 'USER' | 'ROLE';
}

export interface IHasAnyPermissionRequest {
  permission_codes: string[];
}

export interface IHasAllPermissionsRequest {
  permission_codes: string[];
}

export interface IPermissionResolutionParams extends ListParams {
  user_id?: number;
  include_expired?: boolean;
}
