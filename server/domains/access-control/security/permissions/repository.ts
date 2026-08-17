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
  // NOTE: the backend may wrap the list response as { value: IPermission[], Count: number }
  // instead of a Spring Page with content, so we unwrap it here.
  list: async (params?: ListParams): Promise<IPaginatedResponse<IPermission>> => {
    const result = await serverFetch.get<
      IPaginatedResponse<IPermission> | { value: IPermission[]; Count: number } | IPermission[]
    >('/api/access_control/permissions', {
      params,
      revalidate: 300,
      tags: [accessControlTags.permissions()],
    });

    if (Array.isArray(result)) {
      return { content: result } as unknown as IPaginatedResponse<IPermission>;
    }

    if (result && typeof result === 'object' && 'value' in result) {
      return { content: (result as any).value } as unknown as IPaginatedResponse<IPermission>;
    }

    return result as IPaginatedResponse<IPermission>;
  },

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
