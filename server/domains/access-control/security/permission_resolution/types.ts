import 'server-only';
import type { ListParams } from '@/server/lib/types';
import { IPermission } from '../permissions';



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
