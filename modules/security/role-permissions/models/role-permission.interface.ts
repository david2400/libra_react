import type { rolePermissions } from '@/server/domains/access-control/security';

export type IRolePermissionCreateRequest = rolePermissions.ICreateRolePermission;
export type IRolePermissionUpdateRequest = rolePermissions.IUpdateRolePermission;
export type IRolePermission = rolePermissions.IRolePermission;
