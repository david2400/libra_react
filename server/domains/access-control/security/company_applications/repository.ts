import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  ICompanyApplication,
  ICreateCompanyApplication,
  IUpdateCompanyApplication,
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Company Applications Repository ---------------------------------------------

export const companyApplicationsRepository = {
  // List all company applications
  list: (params?: ListParams) =>
    serverFetch.get<IPaginatedResponse<ICompanyApplication>>('/api/access_control/company-applications', {
      params,
      revalidate: 120,
      tags: [accessControlTags.companyApplications()],
    }),

  // Get company application by ID
  getById: (id: string | number) =>
    serverFetch.get<ICompanyApplication>(`/api/access_control/company-applications/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.companyApplication(id)],
    }),

  // Create company application
  create: (payload: ICreateCompanyApplication) =>
    serverFetch.post<ICompanyApplication>('/api/access_control/company-applications', payload, {
      revalidate: false,
    }),

  // Update company application
  update: (id: string | number, payload: IUpdateCompanyApplication) =>
    serverFetch.put<ICompanyApplication>(`/api/access_control/company-applications/${id}`, payload, {
      revalidate: false,
    }),

  // Delete company application
  delete: (id: string | number) =>
    serverFetch.delete<void>(`/api/access_control/company-applications/${id}`, {
      revalidate: false,
    }),

  // Get applications by company
  getByCompany: (companyId: string | number) =>
    serverFetch.get<ICompanyApplication[]>(`/api/access_control/company-applications/company/${companyId}`, {
      revalidate: 180,
      tags: [accessControlTags.companyApplications()],
    }),

  // Get active applications by company
  getActiveByCompany: (companyId: string | number) =>
    serverFetch.get<ICompanyApplication[]>(`/api/access_control/company-applications/company/${companyId}/active`, {
      revalidate: 120,
      tags: [accessControlTags.companyApplications()],
    }),

  // Assign application to company (quick assign)
  assignApplication: (companyId: string | number, applicationId: string | number) =>
    serverFetch.post<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}`, {}, {
      revalidate: false,
    }),

  // Revoke application from company
  revokeApplication: (companyId: string | number, applicationId: string | number) =>
    serverFetch.delete<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}`, {
      revalidate: false,
    }),

  // Activate application license
  activateLicense: (companyId: string | number, applicationId: string | number) =>
    serverFetch.put<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}/activate`, {}, {
      revalidate: false,
    }),

  // Deactivate application license
  deactivateLicense: (companyId: string | number, applicationId: string | number) =>
    serverFetch.put<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}/deactivate`, {}, {
      revalidate: false,
    }),
} as const;
