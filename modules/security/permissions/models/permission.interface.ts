import type { permissions } from '@/server/domains/access-control/security';

export type IPermissionCreateRequest = permissions.ICreatePermissionPayload;
export type IPermissionUpdateRequest = permissions.IUpdatePermissionPayload & { id: string | number };
export type IPermission = permissions.IPermission;
