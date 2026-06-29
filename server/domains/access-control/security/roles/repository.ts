import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IRole,
  ICreateRole,
  IUpdateRole,
  IRoleSearch,

} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Roles Repository ---------------------------------------------------------

export const rolesRepository = {
  // List roles
  list: (params?: ListParams) =>
    serverFetch.get<IPaginatedResponse<IRole>>('/api/access_control/roles', {
      params,
      revalidate: 120,
      tags: [accessControlTags.roles()],
    }),
  // List roles
  getRoles: (params: IRoleSearch) =>
    serverFetch.post<IRole[]>('/api/access_control/roles/search', {
      params,
      revalidate: 120,
      tags: [accessControlTags.roles()],
    }),

  // Get role by ID
  getById: (id: string | number) =>
    serverFetch.get<IRole>(`/api/access_control/roles/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.role(id)],
    }),

  // Create role
  create: (payload: ICreateRole) =>
    serverFetch.post<IRole>('/api/access_control/roles', payload, {
      revalidate: false,
    }),

  // Update role
  update: (id: string | number, payload: IUpdateRole) =>
    serverFetch.put<IRole>(`/api/access_control/roles/${id}`, payload, {
      revalidate: false,
    }),

  // Delete role
  delete: (id: string | number) =>
    serverFetch.delete<void>(`/api/access_control/roles/${id}`, {
      revalidate: false,
    }),
} as const;



