import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IRole, 
  ICreateRolePayload, 
  IUpdateRolePayload,

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

  // Get role by ID
  getById: (id: string | number) => 
    serverFetch.get<IRole>(`/api/access_control/roles/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.role(id)],
    }),

  // Create role
  create: (payload: ICreateRolePayload) => 
    serverFetch.post<IRole>('/api/access_control/roles', payload, {
      revalidate: false,
    }),

  // Update role
  update: (id: string | number, payload: IUpdateRolePayload) => 
    serverFetch.put<IRole>(`/api/access_control/roles/${id}`, payload, {
      revalidate: false,
    }),

  // Delete role
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/roles/${id}`, {
      revalidate: false,
    }),
} as const;



