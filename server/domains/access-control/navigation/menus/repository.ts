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
  list: (params?: ListParams) => 
    serverFetch.get<IMenu[]>('/api/access_control/menus', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

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
  getRootMenus: () => 
    serverFetch.get<IMenu[]>('/api/access_control/menus/root', {
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get menu children
  getChildren: (parentId: string | number) => 
    serverFetch.get<IMenu[]>(`/api/access_control/menus/${parentId}/children`, {
      revalidate: 120,
      tags: [accessControlTags.menu(parentId)],
    }),

  // Get menu path
  getPath: (menuId: string | number) => 
    serverFetch.get<IMenu[]>(`/api/access_control/menus/${menuId}/path`, {
      revalidate: 300,
      tags: [accessControlTags.menu(menuId)],
    }),

  // Search menus by parameters
  getMenus: (params: IMenuSearch) =>
    serverFetch.post<IMenu[]>('/api/access_control/menus/search', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),
} as const;


