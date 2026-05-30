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


export interface IMenuRolePermission {
    menu_id: number;
    role_id: number;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}