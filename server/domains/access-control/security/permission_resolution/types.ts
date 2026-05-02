import 'server-only';
import type { ListParams } from '@/server/lib/types';

// --- IPermission Resolution Types ---------------------------------------------

export interface IPermission {
  idPermission: number;
  name: string;
  description?: string;
  aplicationsId: number;
  moduleAplicationId?: number;
  activo?: boolean;
  usrCrea?: number;
  usrMod?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEffectivePermission extends IPermission {
  source: 'USER' | 'ROLE';
  level?: string;
  roleId?: number;
  roleName?: string;
}

export interface IPermissionCheckRequest {
  permissionCode: string;
  requiredLevel: string;
}

export interface IPermissionCheckResponse {
  hasPermission: boolean;
  effectiveLevel?: string;
  source?: 'USER' | 'ROLE';
}

export interface IHasAnyPermissionRequest {
  permissionCodes: string[];
}

export interface IHasAllPermissionsRequest {
  permissionCodes: string[];
}

export interface IPermissionResolutionParams extends ListParams {
  userId?: number;
  includeExpired?: boolean;
}
