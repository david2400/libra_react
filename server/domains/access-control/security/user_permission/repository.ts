
// --- IUser-IPermission Relationships Repository -----------------------------------

import { IPaginatedResponse, ListParams, accessControlTags, serverFetch } from "@/server";
import { ICreateUserPermission, IUpdateUserPermission, IUserPermission } from ".";
import { IPermission } from "../permissions";
import { IUser } from "../../account/users";

export const userPermissionsRepository = {
    // List user-permissions
    // NOTE: the backend may wrap the list response as { value: IUserPermission[], Count: number }
    // instead of a Spring Page with content, so we unwrap it here.
    list: async (params?: ListParams): Promise<IPaginatedResponse<IUserPermission>> => {
        const result = await serverFetch.get<
            IPaginatedResponse<IUserPermission> | { value: IUserPermission[]; Count: number } | IUserPermission[]
        >('/api/access_control/user-permissions', {
            params,
            revalidate: 120,
            tags: [accessControlTags.userPermissions()],
        });

        if (Array.isArray(result)) {
            return { content: result } as unknown as IPaginatedResponse<IUserPermission>;
        }

        if (result && typeof result === 'object' && 'value' in result) {
            return { content: (result as any).value } as unknown as IPaginatedResponse<IUserPermission>;
        }

        return result as IPaginatedResponse<IUserPermission>;
    },

    // Get user-permission by IDs
    getById: (userId: string | number, permissionId: string | number) =>
        serverFetch.get<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, {
            revalidate: 300,
            tags: [accessControlTags.userPermission(userId, permissionId)],
        }),

    // Get permissions by user
    getPermissionsByUser: (userId: string | number) =>
        serverFetch.get<IUserPermission[]>(`/api/access_control/user-permissions/user/${userId}`, {
            revalidate: false,
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
        serverFetch.post<IUserPermission>('/api/access_control/user-permissions', {
            user_id: Number(userId),
            permission_id: Number(permissionId),
            level: payload.level,
            is_active: payload.is_active ?? true,
            expires_at: payload.expires_at,
        }, {
            revalidate: false,
            headers: { 'X-User-Id': '1' },
        }),

    // Update user-permission relationship
    update: (userId: string | number, permissionId: string | number, payload: IUpdateUserPermission) =>
        serverFetch.put<IUserPermission>(`/api/access_control/user-permissions/${userId}/${permissionId}`, {
            level: payload.level,
            is_active: payload.is_active,
            expires_at: payload.expires_at,
        }, {
            revalidate: false,
            headers: { 'X-User-Id': '1' },
        }),

    // Delete user-permission relationship
    delete: (userId: string | number, permissionId: string | number) =>
        serverFetch.delete<void>(`/api/access_control/user-permissions/${userId}/${permissionId}`, {
            revalidate: false,
        }),
} as const;
