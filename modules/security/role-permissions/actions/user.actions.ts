'use server';

import { getUsers } from '@/server/domains/access-control/account/users';
import { userPermissionsRepository } from '@/server/domains/access-control/security/user_permission/repository';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import { revalidateCacheTag, accessControlTags } from '@/server/lib/cache-tags';
import type { IUser } from '@/server/domains/access-control/account/users';
import type { ICreateUserPermission, IUpdateUserPermission } from '@/server/domains/access-control/security/user_permission/types';

export interface IUserSearchParams {
  application_id?: number;
  search?: string;
  per_page?: number;
  page?: number;
}

function getClientFullName(user: IUser): string {
  const client = user.client;
  if (!client) return '';
  return [
    client.first_name,
    client.second_name,
    client.first_last_name,
    client.second_last_name,
  ]
    .filter(Boolean)
    .join(' ');
}

export const listUsersByApplicationAction = async (
  params: IUserSearchParams,
): Promise<ActionResultType<IUser[]>> => {
  try {
    const { application_id, search, per_page = 30, page = 1 } = params;

    const result = await getUsers({
      per_page,
      page,
      filters: {
        application_id,
        search,
      } as any,
    });

    const users = Array.isArray(result) ? result : result.content || [];

    if (!search || !search.trim()) {
      return { success: true, data: users };
    }

    const terms = search
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const filtered = users.filter((user: IUser) => {
      const fullName = getClientFullName(user).toLowerCase();
      const username = (user.username || '').toLowerCase();
      const cardId = (user.client?.card_id || '').toLowerCase();
      const typeId = (user.client?.type_id || '').toLowerCase();
      const haystack = [fullName, username, cardId, typeId].join(' ');

      return terms.every((term) => haystack.includes(term));
    });

    return { success: true, data: filtered };
  } catch (error) {
    throw error;
  }
};

// --- User Permissions Actions -------------------------------------------------

export const listPermissionsByUserAction = async (
  userId: string | number,
): Promise<ActionResultType<any[]>> => {
  try {
    const response = await userPermissionsRepository.getPermissionsByUser(userId);
    const userPermissions = Array.isArray(response)
      ? response
      : (response as any)?.content || (response as any)?.value || [];

    return { success: true, data: userPermissions };
  } catch (error) {
    throw error;
  }
};

export const createUserPermissionAction = async (
  userId: string | number,
  permissionId: string | number,
  payload: Pick<ICreateUserPermission, 'level' | 'expires_at'>,
): Promise<ActionResultType<any>> => {
  try {
    const createPayload: ICreateUserPermission = {
      user_id: Number(userId),
      permission_id: Number(permissionId),
      level: payload.level,
      is_active: true,
      expires_at: payload.expires_at,
    };
    const newPermission = await userPermissionsRepository.create(userId, permissionId, createPayload);
    await revalidateCacheTag(accessControlTags.userPermissions());
    return { success: true, data: newPermission };
  } catch (error) {
    throw error;
  }
};

export const updateUserPermissionAction = async (
  userId: string | number,
  permissionId: string | number,
  payload: Pick<IUpdateUserPermission, 'level' | 'is_active' | 'expires_at'>,
): Promise<ActionResultType<any>> => {
  try {
    const updatePayload: IUpdateUserPermission = {
      level: payload.level,
      is_active: payload.is_active,
      expires_at: payload.expires_at,
    };
    const updatedPermission = await userPermissionsRepository.update(userId, permissionId, updatePayload);
    await revalidateCacheTag(accessControlTags.userPermissions());
    return { success: true, data: updatedPermission };
  } catch (error) {
    throw error;
  }
};

export const deleteUserPermissionAction = async (
  userId: string | number,
  permissionId: string | number,
): Promise<ActionResultType<void>> => {
  try {
    await userPermissionsRepository.delete(userId, permissionId);
    await revalidateCacheTag(accessControlTags.userPermissions());
    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};
