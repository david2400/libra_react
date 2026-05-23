import type { permissions } from '@/server/domains/access-control/security';

export type IPermissionCreateRequest = permissions.ICreatePermission;
export type IPermissionUpdateRequest = permissions.IUpdatePermission;
export type IPermission = permissions.IPermission;


export type PermissionAction =
    | 'CREATE'
    | 'READ'
    | 'UPDATE'
    | 'DELETE'
    | 'EXECUTE'
    | 'VIEW'
    | 'MANAGE'
    | 'ADMIN'
    | 'APPROVE'
    | 'REJECT';

export type PermissionType = 'API' | 'APPLICATION' | 'UI' | 'SYSTEM';