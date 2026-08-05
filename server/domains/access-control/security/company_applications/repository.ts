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
    serverFetch
      .get<IPaginatedResponse<ICompanyApplication> | ICompanyApplication[]>('/api/access_control/company-applications', {
        params,
        revalidate: 120,
        tags: [accessControlTags.companyApplications()],
      })
      .then((res) => res),

  // Get company application by ID
  getById: (id: string | number) =>
    serverFetch
      .get<ICompanyApplication>(`/api/access_control/company-applications/${id}`, {
        revalidate: 300,
        tags: [accessControlTags.companyApplication(id)],
      })
      .then((data) => data),

  // Create company application
  create: async (payload: ICreateCompanyApplication) => {
    console.log('[company-applications:create] payload:', JSON.stringify(payload));
    const companyApplication = await serverFetch.post<any>('/api/access_control/company-applications', payload, {
      revalidate: false,
    });
    return companyApplication;
  },

  // Update company application
  update: async (id: string | number, payload: IUpdateCompanyApplication) => {
   
    console.log('[company-applications:update] payload:', JSON.stringify(payload));
    const companyApplication = await serverFetch.put<ICompanyApplication>(`/api/access_control/company-applications/${id}`, payload, {
      revalidate: false,
    });
    return companyApplication;
  },

  // Delete company application
  delete: (id: string | number) =>
    serverFetch.delete<void>(`/api/access_control/company-applications/${id}`, {
      revalidate: false,
    }),

  // Get applications by company
  getByCompany: (companyId: string | number) =>
    serverFetch
      .get<ICompanyApplication[]>(`/api/access_control/company-applications/company/${companyId}`, {
        revalidate: 180,
        tags: [accessControlTags.companyApplications()],
      })
      .then((res) => (Array.isArray(res) ? res : [])),

  // Get active applications by company
  getActiveByCompany: (companyId: string | number) =>
    serverFetch
      .get<ICompanyApplication[]>(`/api/access_control/company-applications/company/${companyId}/active`, {
        revalidate: 120,
        tags: [accessControlTags.companyApplications()],
      })
      .then((res) => (Array.isArray(res) ? res : [])),

  // Assign application to company (quick assign)
  assignApplication: (companyId: string | number, applicationId: string | number) =>
    serverFetch
      .post<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}`, {}, {
        revalidate: false,
      })
      .then((data) => data),

  // Revoke application from company
  revokeApplication: (companyId: string | number, applicationId: string | number) =>
    serverFetch
      .delete<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}`, {
        revalidate: false,
      })
      .then((data) => data),

  // Activate application license
  activateLicense: (companyId: string | number, applicationId: string | number) =>
    serverFetch
      .put<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}/activate`, {}, {
        revalidate: false,
      })
      .then((data) => data),

  // Deactivate application license
  deactivateLicense: (companyId: string | number, applicationId: string | number) =>
    serverFetch
      .put<ICompanyApplication>(`/api/access_control/company-applications/company/${companyId}/application/${applicationId}/deactivate`, {}, {
        revalidate: false,
      })
      .then((data) => data),
} as const;
