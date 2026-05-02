import type { rolePermissions } from '@/server/domains/access-control/security';

export type IRolePermissionCreateRequest = rolePermissions.ICreateRolePermissionPayload;
export type IRolePermissionUpdateRequest = rolePermissions.IUpdateRolePermissionPayload & { roleId: string | number; permissionId: string | number };
export type IRolePermission = rolePermissions.IRolePermission;
export type IRole = rolePermissions.IRole;
export type IPermission = rolePermissions.IPermission;
