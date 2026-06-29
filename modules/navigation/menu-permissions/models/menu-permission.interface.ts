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
    // Backend identifier of the persisted row. Undefined/null => new (create on save).
    id_menu_permission?: number | null;
    menu_id: number;
    role_id: number;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
}

// --- Bulk Operations (camelCase DTO re-exported from the backend domain) ------

export type IMenuPermissionAssignmentType = menuPermissions.MenuPermissionAssignmentType;
export type IBulkMenuPermissionItem = menuPermissions.IMenuPermissionBulkItem;
export type IBulkMenuPermissionRequest = menuPermissions.IMenuPermissionBulkRequest;