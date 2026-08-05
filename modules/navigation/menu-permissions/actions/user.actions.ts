'use server';

import { getUsers } from '@/server/domains/access-control/account/users';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { IUser } from '@/server/domains/access-control/account/users';

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
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      };
    }
    return {
      success: false,
      error: {
        message: 'Failed to load users',
        details: error,
      },
    };
  }
};
