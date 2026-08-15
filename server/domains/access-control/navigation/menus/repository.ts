import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ICreateMenu, IUpdateMenu, IMenuTree, IMenuHierarchy, IMenuSearch } from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { IMenu } from './types';
import type { ICreateMenuPermission, IUpdateMenuPermission } from '../menu_permissions/types';
import type { IPermission } from '../../security/permissions';

// --- Menus Repository ---------------------------------------------------------

export const menusRepository = {
  // List menus
  // NOTE: the backend wraps the list response as `{ value: IMenu[], Count: number }`
  // instead of returning a bare array, so we unwrap it here.
  list: async (params?: ListParams): Promise<IMenu[]> => {
    const result = await serverFetch.get<IMenu[] | { value: IMenu[]; Count: number }>(
      '/api/access_control/menus',
      {
        params,
        revalidate: 120,
        tags: [accessControlTags.menus()],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },

  // Get menu by ID
  getById: (id: string | number) => 
    serverFetch.get<IMenu>(`/api/access_control/menus/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.menu(id)],
    }),

  // Create menu
  create: (payload: ICreateMenu) => 
    serverFetch.post<IMenu>('/api/access_control/menus', payload, {
      revalidate: false,
    }),

  // Update menu
  update: (id: string | number, payload: IUpdateMenu) => 
    serverFetch.put<IMenu>(`/api/access_control/menus/${id}`, payload, {
      revalidate: false,
    }),

  // Delete menu
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/menus/${id}`, {
      revalidate: false,
    }),

  // Get menu tree
  getTree: (params?: ListParams) => 
    serverFetch.get<IMenuTree>('/api/access_control/menus/tree', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get flat menu structure
  getFlat: (params?: ListParams) => 
    serverFetch.get<{ menus: IMenu[] }>('/api/access_control/menus/flat', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get root menus
  getRootMenus: async (): Promise<IMenu[]> => {
    const result = await serverFetch.get<IMenu[] | { value: IMenu[]; Count: number }>(
      '/api/access_control/menus/root',
      {
        revalidate: 120,
        tags: [accessControlTags.menus()],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },

  // Get menu children
  getChildren: async (parentId: string | number): Promise<IMenu[]> => {
    const result = await serverFetch.get<IMenu[] | { value: IMenu[]; Count: number }>(
      `/api/access_control/menus/${parentId}/children`,
      {
        revalidate: 120,
        tags: [accessControlTags.menu(parentId)],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },

  // Get menu path
  getPath: async (menuId: string | number): Promise<IMenu[]> => {
    const result = await serverFetch.get<IMenu[] | { value: IMenu[]; Count: number }>(
      `/api/access_control/menus/${menuId}/path`,
      {
        revalidate: 300,
        tags: [accessControlTags.menu(menuId)],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },

  // Search menus by parameters
  getMenus: async (params: IMenuSearch): Promise<IMenu[]> => {
    const result = await serverFetch.post<IMenu[] | { value: IMenu[]; Count: number }>(
      '/api/access_control/menus/search',
      {
        params,
        revalidate: 120,
        tags: [accessControlTags.menus()],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },
} as const;


