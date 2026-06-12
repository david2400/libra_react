import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IPermission,
  ICreatePermission,
  IUpdatePermission,
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Permissions Repository -----------------------------------------------------

export const permissionsRepository = {
  // List permissions
  list: (params?: ListParams) =>
    serverFetch.get<IPaginatedResponse<IPermission>>('/api/access_control/permissions', {
      params,
      revalidate: 300,
      tags: [accessControlTags.permissions()],
    }),

  // Get permission by ID
  getById: (id: string | number) =>
    serverFetch.get<IPermission>(`/api/access_control/permissions/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.permission(id)],
    }),

  // Create permission
  create: (payload: ICreatePermission) =>
    serverFetch.post<IPermission>('/api/access_control/permissions', payload, {
      revalidate: false,
    }),

  // Update permission
  update: (id: string | number, payload: IUpdatePermission) =>
    serverFetch.put<IPermission>(`/api/access_control/permissions/${id}`, payload, {
      revalidate: false,
    }),

  // Delete permission
  delete: (id: string | number) =>
    serverFetch.delete<void>(`/api/access_control/permissions/${id}`, {
      revalidate: false,
    }),
} as const;
