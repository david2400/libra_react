// import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IApplicationCategory,
  ICreateApplicationCategory,
  IUpdateApplicationCategory,
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Application Categories Repository ---------------------------------------------

export const applicationCategoriesRepository = {
  // List all categories
  // NOTE: the backend wraps the list response as `{ value: IApplicationCategory[], Count: number }`
  // instead of returning a bare array, so we unwrap it here.
  list: async (params?: ListParams): Promise<IApplicationCategory[]> => {
    const result = await serverFetch.get<IApplicationCategory[] | { value: IApplicationCategory[]; Count: number }>(
      '/api/access_control/application-categories',
      {
        params,
        revalidate: 300,
        tags: [accessControlTags.applicationCategories()],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },

  // Get category by ID
  getById: (id: string | number) =>
    serverFetch.get<IApplicationCategory>(`/api/access_control/application-categories/${id}`, {
      revalidate: 600,
      tags: [accessControlTags.applicationCategory(id)],
    }),

  // Create category
  create: (payload: ICreateApplicationCategory) =>
    serverFetch.post<IApplicationCategory>('/api/access_control/application-categories', payload, {
      revalidate: false,
    }),

  // Update category
  update: (id: string | number, payload: IUpdateApplicationCategory) =>
    serverFetch.put<IApplicationCategory>(`/api/access_control/application-categories/${id}`, payload, {
      revalidate: false,
    }),

  // Delete category
  delete: (id: string | number) =>
    serverFetch.delete<void>(`/api/access_control/application-categories/${id}`, {
      revalidate: false,
    }),

  // Get categories by parent
  getByParentId: async (parentId: string | number): Promise<IApplicationCategory[]> => {
    const result = await serverFetch.get<IApplicationCategory[] | { value: IApplicationCategory[]; Count: number }>(
      `/api/access_control/application-categories/parent/${parentId}`,
      {
        revalidate: 300,
        tags: [accessControlTags.applicationCategories()],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },

  // Get active categories
  getActive: () =>
    serverFetch.get<IApplicationCategory[]>('/api/access_control/application-categories/active', {
      revalidate: 300,
      tags: [accessControlTags.applicationCategories()],
    }),

  // Get root categories (categories without parent)
  getRootCategories: async (): Promise<IApplicationCategory[]> => {
    const result = await serverFetch.get<IApplicationCategory[] | { value: IApplicationCategory[]; Count: number }>(
      '/api/access_control/application-categories/root',
      {
        revalidate: 300,
        tags: [accessControlTags.applicationCategories()],
      }
    );

    return Array.isArray(result) ? result : result?.value ?? [];
  },

  // Get category tree
  getCategoryTree: () =>
    serverFetch.get<any>('/api/access_control/application-categories/tree', {
      revalidate: 300,
      tags: [accessControlTags.applicationCategories()],
    }),

  // Get applications in category
  getApplications: (categoryId: string | number) =>
    serverFetch.get<any[]>(`/api/access_control/application-categories/${categoryId}/applications`, {
      revalidate: 300,
      tags: [accessControlTags.applicationCategory(categoryId)],
    }),

  // Assign application to category
  assignApplication: (categoryId: string | number, applicationId: string | number, isPrimary?: boolean) =>
    serverFetch.post<any>(`/api/access_control/application-categories/${categoryId}/applications/${applicationId}`, 
      { is_primary: isPrimary }, {
      revalidate: false,
    }),

  // Unassign application from category
  unassignApplication: (categoryId: string | number, applicationId: string | number) =>
    serverFetch.delete<any>(`/api/access_control/application-categories/${categoryId}/applications/${applicationId}`, {
      revalidate: false,
    }),

  // Bulk assign applications to category
  bulkAssignApplications: (categoryId: string | number, applicationIds: (string | number)[], isPrimary?: boolean) =>
    serverFetch.post<any>(`/api/access_control/application-categories/${categoryId}/bulk-assign`, 
      { application_ids: applicationIds, is_primary: isPrimary }, {
      revalidate: false,
    }),

  // Reorder categories
  reorderCategories: (categoryIds: Array<{ id: number; sort_order: number }>) =>
    serverFetch.put<any>('/api/access_control/application-categories/reorder', categoryIds, {
      revalidate: false,
    }),

  // Activate category
  activate: (id: string | number) =>
    serverFetch.put<IApplicationCategory>(`/api/access_control/application-categories/${id}/activate`, {}, {
      revalidate: false,
    }),

  // Deactivate category
  deactivate: (id: string | number) =>
    serverFetch.put<IApplicationCategory>(`/api/access_control/application-categories/${id}/deactivate`, {}, {
      revalidate: false,
    }),
} as const;
