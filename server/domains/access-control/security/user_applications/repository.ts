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
    serverFetch.get<IPaginatedResponse<IUserApplication>>('/api/access_control/user-applications', {
      params,
      revalidate: 120,
      tags: [accessControlTags.userApplications()],
    }),

  // Get user application by ID
  getById: (id: string | number) =>
    serverFetch.get<IUserApplication>(`/api/access_control/user-applications/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.userApplication(id)],
    }),

  // Create user application
  create: (payload: ICreateUserApplication) =>
    serverFetch.post<IUserApplication>('/api/access_control/user-applications', payload, {
      revalidate: false,
    }),

  // Update user application
  update: (id: string | number, payload: IUpdateUserApplication) =>
    serverFetch.put<IUserApplication>(`/api/access_control/user-applications/${id}`, payload, {
      revalidate: false,
    }),

  // Delete user application
  delete: (id: string | number) =>
    serverFetch.delete<void>(`/api/access_control/user-applications/${id}`, {
      revalidate: false,
    }),

  // Get applications by user
  getByUser: (userId: string | number) =>
    serverFetch.get<IUserApplication[]>(`/api/access_control/user-applications/user/${userId}`, {
      revalidate: 180,
      tags: [accessControlTags.userApplications()],
    }),

  // Get active applications by user
  getActiveByUser: (userId: string | number) =>
    serverFetch.get<IUserApplication[]>(`/api/access_control/user-applications/user/${userId}/active`, {
      revalidate: 120,
      tags: [accessControlTags.userApplications()],
    }),

  // Assign application to user (quick assign)
  assignApplication: (userId: string | number, applicationId: string | number) =>
    serverFetch.post<IUserApplication>(`/api/access_control/user-applications/user/${userId}/application/${applicationId}`, {}, {
      revalidate: false,
    }),

  // Revoke application from user
  revokeApplication: (userId: string | number, applicationId: string | number) =>
    serverFetch.delete<IUserApplication>(`/api/access_control/user-applications/user/${userId}/application/${applicationId}`, {
      revalidate: false,
    }),

  // Activate application license
  activateLicense: (userId: string | number, applicationId: string | number) =>
    serverFetch.put<IUserApplication>(`/api/access_control/user-applications/user/${userId}/application/${applicationId}/activate`, {}, {
      revalidate: false,
    }),

  // Deactivate application license
  deactivateLicense: (userId: string | number, applicationId: string | number) =>
    serverFetch.put<IUserApplication>(`/api/access_control/user-applications/user/${userId}/application/${applicationId}/deactivate`, {}, {
      revalidate: false,
    }),
} as const;
