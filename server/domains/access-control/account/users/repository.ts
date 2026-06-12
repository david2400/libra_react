import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IUser,
  ICreateUser,
  IUpdateUser,
  IUserListParams
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Users Repository -------------------------------------------------

export const usersRepository = {
  // List users
  list: (params?: IUserListParams) => 
    serverFetch.get<IPaginatedResponse<IUser>>('/api/access_control/users', {
      params,
      revalidate: 120,
      tags: [accessControlTags.users()],
    }),

  // Get user by ID
  getById: (id: number) => 
    serverFetch.get<IUser>(`/api/access_control/users/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.user(id)],
    }),

  // Create user
  create: (payload: ICreateUser) => 
    serverFetch.post<IUser>('/api/access_control/users', payload, {
      revalidate: false,
    }),

  // Update user
  update: (id: number, payload: IUpdateUser) => 
    serverFetch.put<IUser>(`/api/access_control/users/${id}`, payload, {
      revalidate: false,
    }),

  // Delete user
  delete: (id: number) => 
    serverFetch.delete<void>(`/api/access_control/users/${id}`, {
      revalidate: false,
    }),
} as const;
