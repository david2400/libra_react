
// --- IUser-IPermission Relationships Repository -----------------------------------

import { IPaginatedResponse, ListParams, accessControlTags, serverFetch } from "@/server";
import { ICreateUserPermission, IUpdateUserPermission, IUserPermission } from ".";
import { IPermission } from "../permissions";
import { IUser } from "../../account/users";

export const userPermissionsRepository = {
    // List user-permissions
    list: (params?: ListParams) =>
        serverFetch.get<IPaginatedResponse<IUserPermission>>('/api/access_control/user-permissions', {
            params,
            revalidate: 120,
            tags: [accessControlTags.userPermissions()],
        }),

    // Get user-permission by IDs
    getById: (userId: string | number, permissionId: string | number) =>
        serverFetch.get<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, {
            revalidate: 300,
            tags: [accessControlTags.userPermission(userId, permissionId)],
        }),

    // Get permissions by user
    getPermissionsByUser: (userId: string | number) =>
        serverFetch.get<IPermission[]>(`/api/access_control/user-permissions/user/${userId}`, {
            revalidate: 120,
            tags: [accessControlTags.user(userId)],
        }),

    // Get users by permission
    getUsersByPermission: (permissionId: string | number) =>
        serverFetch.get<IUser[]>(`/api/access_control/user-permissions/permission/${permissionId}`, {
            revalidate: 300,
            tags: [accessControlTags.permission(permissionId)],
        }),

    // Create user-permission relationship
    create: (userId: string | number, permissionId: string | number, payload: ICreateUserPermission) =>
        serverFetch.post<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, payload, {
            revalidate: false,
        }),

    // Update user-permission relationship
    update: (userId: string | number, permissionId: string | number, payload: IUpdateUserPermission) =>
        serverFetch.put<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, payload, {
            revalidate: false,
        }),

    // Delete user-permission relationship
    delete: (userId: string | number, permissionId: string | number) =>
        serverFetch.delete<void>(`/api/access_control/user-permissions/${userId}/${permissionId}`, {
            revalidate: false,
        }),
} as const;