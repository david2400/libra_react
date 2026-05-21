import type { permissions } from '@/server/domains/access-control/security';

export type IPermissionCreateRequest = permissions.ICreatePermission;
export type IPermissionUpdateRequest = permissions.IUpdatePermission;
export type IPermission = permissions.IPermission;
