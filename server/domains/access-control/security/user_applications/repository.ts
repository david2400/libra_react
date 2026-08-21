import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IUserApplication,
  ICreateUserApplication,
  IUpdateUserApplication,
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- User Applications Repository ---------------------------------------------

export const userApplicationsRepository = {
  // List all user applications
  list: (params?: ListParams) =>
    serverFetch
      .get<IPaginatedResponse<IUserApplication> | IUserApplication[]>('/api/access_control/api/user-applications', {
        params,
        revalidate: 120,
        tags: [accessControlTags.userApplications()],
      })
      .then((res) => res),

  // Get user application by ID
  getById: (id: string | number) =>
    serverFetch
      .get<IUserApplication>(`/api/access_control/api/user-applications/${id}`, {
        revalidate: 300,
        tags: [accessControlTags.userApplication(id)],
      })
      .then((data) => data),

  // Create user application
  create: async (payload: ICreateUserApplication) => {
    console.log('[user-applications:create] payload:', JSON.stringify(payload));
    const userApplication = await serverFetch.post<IUserApplication>('/api/access_control/api/user-applications', payload, {
      revalidate: false,
    });
    return userApplication;
  },

  // Update user application
  update: async (id: string | number, payload: IUpdateUserApplication) => {
    console.log('[user-applications:update] payload:', JSON.stringify(payload));
    const userApplication = await serverFetch.put<IUserApplication>('/api/access_control/api/user-applications', payload, {
      revalidate: false,
    });
    return userApplication;
  },

  // Delete user application
  delete: (id: string | number) =>
    serverFetch.delete<void>(`/api/access_control/api/user-applications/${id}`, {
      revalidate: false,
    }),

  // Get applications by user
  getByUser: (userId: string | number) =>
    serverFetch
      .get<IUserApplication[]>(`/api/access_control/api/user-applications/user/${userId}`, {
        revalidate: 180,
        tags: [accessControlTags.userApplications()],
      })
      .then((res) => (Array.isArray(res) ? res : [])),

  // Get active applications by user
  getActiveByUser: (userId: string | number) =>
    serverFetch
      .get<IUserApplication[]>(`/api/access_control/api/user-applications/user/${userId}/active`, {
        revalidate: 120,
        tags: [accessControlTags.userApplications()],
      })
      .then((res) => (Array.isArray(res) ? res : [])),

  // Assign or reactivate application to user
  assignApplication: (userId: string | number, companyApplicationId: string | number) =>
    serverFetch
      .post<IUserApplication>(`/api/access_control/api/user-applications/user/${userId}/application/${companyApplicationId}`, undefined, {
        revalidate: false,
      }),

  // Revoke application from user
  revokeApplication: (userId: string | number, applicationId: string | number) =>
    serverFetch
      .delete<IUserApplication>(`/api/access_control/api/user-applications/${userId}/${applicationId}`, {
        revalidate: false,
      })
      .then((data) => data),

  // Activate application license
  activateLicense: (userId: string | number, companyApplicationId: string | number) =>
    serverFetch
      .put<IUserApplication>(`/api/access_control/api/user-applications/user/${userId}/application/${companyApplicationId}/activate`, undefined, {
        revalidate: false,
      })
      .then((data) => data),

  // Deactivate application license
  deactivateLicense: (userId: string | number, companyApplicationId: string | number) =>
    serverFetch
      .put<IUserApplication>(`/api/access_control/api/user-applications/user/${userId}/application/${companyApplicationId}/deactivate`, undefined, {
        revalidate: false,
      })
      .then((data) => data),
} as const;
