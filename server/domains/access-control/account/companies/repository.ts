import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  ICompany, 
  ICreateCompanyPayload, 
  IUpdateCompanyPayload,
  IClient,
  ICompanyClient,
  ICreateCompanyClientPayload,
  IUpdateCompanyClientPayload,
  ICompanyStats,
  ICompanyOverview,
  ICompanyActivity,
  ICompanyActivityFilter,
  ICompanyConfig,
  ICreateCompanyConfigPayload,
  IUpdateCompanyConfigPayload,
  ICompanyHealth,
  ICompanyHealthResponse
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Companies Repository -----------------------------------------------------

export const companiesRepository = {
  // List companies
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ICompany>>('/api/access_control/companies', {
      params,
      revalidate: 120,
      tags: [accessControlTags.companies()],
    }),

  // Get company by ID
  getById: (id: string | number) => 
    serverFetch.get<ICompany>(`/api/access_control/companies/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.company(id)],
    }),

  // Create company
  create: (payload: ICreateCompanyPayload) => 
    serverFetch.post<ICompany>('/api/access_control/companies', payload, {
      revalidate: false,
    }),

  // Update company
  update: (id: string | number, payload: IUpdateCompanyPayload) => 
    serverFetch.put<ICompany>(`/api/access_control/companies/${id}`, payload, {
      revalidate: false,
    }),

  // Delete company
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/companies/${id}`, {
      revalidate: false,
    }),

  // Get active companies
  getActive: () => 
    serverFetch.get<ICompany[]>('/api/access_control/companies/active', {
      revalidate: 60,
      tags: [accessControlTags.companies()],
    }),
} as const;

// --- ICompany-Client Relationships Repository -------------------------------

export const companyClientsRepository = {
  // List company-clients
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ICompanyClient>>('/api/access_control/company-clients', {
      params,
      revalidate: 120,
      tags: [accessControlTags.companies()],
    }),

  // Get company-client by IDs
  getById: (companyId: string | number, clientId: string | number) => 
    serverFetch.get<ICompanyClient>(`/api/access_control/company-clients/${companyId}/${clientId}`, {
      revalidate: 300,
      tags: [accessControlTags.company(companyId)],
    }),

  // Get clients by company
  getClientsByCompany: (companyId: string | number) => 
    serverFetch.get<IClient[]>(`/api/access_control/company-clients/company/${companyId}`, {
      revalidate: 120,
      tags: [accessControlTags.company(companyId)],
    }),

  // Get companies by client
  getCompaniesByClient: (clientId: string | number) => 
    serverFetch.get<ICompany[]>(`/api/access_control/company-clients/client/${clientId}`, {
      revalidate: 300,
      tags: [accessControlTags.client(clientId)],
    }),

  // Get primary clients for company
  getPrimaryClients: (companyId: string | number) => 
    serverFetch.get<IClient[]>(`/api/access_control/company-clients/company/${companyId}/primary`, {
      revalidate: 300,
      tags: [accessControlTags.company(companyId)],
    }),

  // Create company-client relationship
  create: (companyId: string | number, clientId: string | number, payload: ICreateCompanyClientPayload) => 
    serverFetch.post<ICompanyClient>(`/api/access_control/company-clients/${companyId}/${clientId}`, payload, {
      revalidate: false,
    }),

  // Update company-client relationship
  update: (companyId: string | number, clientId: string | number, payload: IUpdateCompanyClientPayload) => 
    serverFetch.put<ICompanyClient>(`/api/access_control/company-clients/${companyId}/${clientId}`, payload, {
      revalidate: false,
    }),

  // Delete company-client relationship
  delete: (companyId: string | number, clientId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/company-clients/${companyId}/${clientId}`, {
      revalidate: false,
    }),
} as const;

// --- ICompany Statistics Repository -------------------------------------------

export const companyStatsRepository = {
  // Get company statistics
  getStats: (companyId: string | number) => 
    serverFetch.get<ICompanyStats>(`/api/access_control/companies/${companyId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.company(companyId)],
    }),

  // Get all companies statistics
  getAllStats: () => 
    serverFetch.get<ICompanyStats[]>('/api/access_control/companies/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.companies()],
    }),

  // Get company overview
  getOverview: (companyId: string | number) => 
    serverFetch.get<ICompanyOverview>(`/api/access_control/companies/${companyId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.company(companyId)],
    }),
} as const;

// --- ICompany Activity Repository ---------------------------------------------

export const companyActivityRepository = {
  // List company activities
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ICompanyActivity>>('/api/access_control/company-activities', {
      params,
      revalidate: 120,
      tags: [accessControlTags.companies()],
    }),

  // Get activities by company
  getByCompany: (companyId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ICompanyActivity>>(`/api/access_control/company-activities/company/${companyId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.company(companyId)],
    }),

  // Create activity log
  create: (activity: Omit<ICompanyActivity, 'id' | 'createdAt'>) => 
    serverFetch.post<ICompanyActivity>('/api/access_control/company-activities', activity, {
      revalidate: false,
    }),

  // Get recent activities
  getRecent: (companyId: string | number, limit: number = 10) => 
    serverFetch.get<ICompanyActivity[]>(`/api/access_control/company-activities/company/${companyId}/recent`, {
      params: { limit },
      revalidate: 60,
      tags: [accessControlTags.company(companyId)],
    }),
} as const;

// --- ICompany Configuration Repository -------------------------------------

export const companyConfigRepository = {
  // List company configs
  list: (companyId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ICompanyConfig>>(`/api/access_control/companies/${companyId}/config`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.company(companyId)],
    }),

  // Get config by key
  getByKey: (companyId: string | number, key: string) => 
    serverFetch.get<ICompanyConfig>(`/api/access_control/companies/${companyId}/config/${key}`, {
      revalidate: 300,
      tags: [accessControlTags.company(companyId)],
    }),

  // Create config
  create: (companyId: string | number, payload: ICreateCompanyConfigPayload) => 
    serverFetch.post<ICompanyConfig>(`/api/access_control/companies/${companyId}/config`, payload, {
      revalidate: false,
    }),

  // Update config
  update: (companyId: string | number, key: string, payload: IUpdateCompanyConfigPayload) => 
    serverFetch.put<ICompanyConfig>(`/api/access_control/companies/${companyId}/config/${key}`, payload, {
      revalidate: false,
    }),

  // Delete config
  delete: (companyId: string | number, key: string) => 
    serverFetch.delete<void>(`/api/access_control/companies/${companyId}/config/${key}`, {
      revalidate: false,
    }),
} as const;

// --- ICompany Health Repository ---------------------------------------------

export const companyHealthRepository = {
  // Check company health
  checkHealth: (companyId: string | number) => 
    serverFetch.get<ICompanyHealthResponse>(`/api/access_control/companies/${companyId}/health`, {
      revalidate: 30,
      // tags: [accessControlTags.companyHealth(companyId)],
    }),

  // Check all companies health
  checkAllHealth: () => 
    serverFetch.get<ICompanyHealthResponse[]>('/api/access_control/companies/health/bulk', {
      revalidate: 30,
      tags: [accessControlTags.companies()],
    }),

  // Get health history
  getHealthHistory: (companyId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<ICompanyHealth>>(`/api/access_control/companies/${companyId}/health/history`, {
      params,
      revalidate: 300,
      // tags: [accessControlTags.companyHealth(companyId)],
    }),
} as const;
