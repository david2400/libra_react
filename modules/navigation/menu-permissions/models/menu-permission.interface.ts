import type { menuPermissions } from '@/server/domains/access-control/navigation';

export type IMenuPermissionCreateRequest = menuPermissions.ICreateMenuPermissionPayload;
export type IMenuPermissionUpdateRequest = menuPermissions.IUpdateMenuPermissionPayload & { menuId: string | number; permissionId: string | number };
export type IMenuPermission = menuPermissions.IMenuPermission;
export type IMenu = menuPermissions.IMenu;
export type IPermission = menuPermissions.IPermission;
