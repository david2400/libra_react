import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ICreateMenuPayload, IUpdateMenuPayload } from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IMenu } from '@/modules/navigation/menus/models/menu.interface';
import { IUser } from '@/modules/account/users/models/user.interface';
import { IRoleMenu } from '@/modules/navigation/role-menus/models/role-menu.interface';
import { IMenuPermission, IPermission } from '@/modules/navigation/menu-permissions/models/menu-permission.interface';
import { ICreateMenuPermission, IUpdateMenuPermission } from '../menu_permissions';

// --- Menus Repository ---------------------------------------------------------

export const menusRepository = {
  // List menus
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IMenu>>('/api/access_control/menus', {
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
  create: (payload: ICreateMenuPayload) => 
    serverFetch.post<IMenu>('/api/access_control/menus', payload, {
      revalidate: false,
    }),

  // Update menu
  update: (id: string | number, payload: IUpdateMenuPayload) => 
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
    serverFetch.get<IMenuTreeResponse>('/api/access_control/menus/tree', {
      params,
      revalidate: 120,
      tags: [accessControlTags.menus()],
    }),

  // Get flat menu structure
  getFlat: (params?: ListParams) => 
    serverFetch.get<FlatMenuResponse>('/api/access_control/menus/flat', {
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
} as const;


