
import { ActionResultType, ServerApiError, accessControlTags, revalidateCacheTag } from "@/server";
import { ICreateUserPermission, IUpdateUserPermission } from "./types";
import { userPermissionsRepository } from "./repository";

export const createUserPermissionAction = async (userId: string | number, permissionId: string | number, payload: ICreateUserPermission): Promise<ActionResultType<any>> => {
    try {
        const userPermission = await userPermissionsRepository.create(userId, permissionId, payload);

        // Revalidate cache tags
        await revalidateCacheTag(accessControlTags.userPermissions());
        await revalidateCacheTag(accessControlTags.userPermission(userId, permissionId));
        await revalidateCacheTag(accessControlTags.user(userId));
        await revalidateCacheTag(accessControlTags.permission(permissionId));

        return { success: true, data: userPermission };
    } catch (error) {
        if (error instanceof ServerApiError) {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details
                }
            };
        }

        return {
            success: false,
            error: {
                message: 'Failed to create user-permission relationship',
                details: error
            }
        };
    }
};

export const updateUserPermissionAction = async (userId: string | number, permissionId: string | number, payload: IUpdateUserPermission): Promise<ActionResultType<any>> => {
    try {
        const userPermission = await userPermissionsRepository.update(userId, permissionId, payload);

        // Revalidate cache tags
        await revalidateCacheTag(accessControlTags.userPermissions());
        await revalidateCacheTag(accessControlTags.userPermission(userId, permissionId));

        return { success: true, data: userPermission };
    } catch (error) {
        if (error instanceof ServerApiError) {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details
                }
            };
        }

        return {
            success: false,
            error: {
                message: 'Failed to update user-permission relationship',
                details: error
            }
        };
    }
};

export const deleteUserPermissionAction = async (userId: string | number, permissionId: string | number): Promise<ActionResultType<void>> => {
    try {
        await userPermissionsRepository.delete(userId, permissionId);

        // Revalidate cache tags
        await revalidateCacheTag(accessControlTags.userPermissions());
        await revalidateCacheTag(accessControlTags.userPermission(userId, permissionId));

        return { success: true, data: undefined };
    } catch (error) {
        if (error instanceof ServerApiError) {
            return {
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details
                }
            };
        }

        return {
            success: false,
            error: {
                message: 'Failed to delete user-permission relationship',
                details: error
            }
        };
    }
};
