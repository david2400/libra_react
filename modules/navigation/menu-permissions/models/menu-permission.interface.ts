import type { menuPermissions } from '@/server/domains/access-control/navigation';

export type IMenuPermissionCreateRequest = menuPermissions.ICreateMenuPermission;
export type IMenuPermissionUpdateRequest = menuPermissions.IUpdateMenuPermission;
export type IMenuPermission = menuPermissions.IMenuPermission;

export interface MenuItem {
    id: string;
    name: string;
    icon: string;
    path: string;
    children?: MenuItem[];
}
