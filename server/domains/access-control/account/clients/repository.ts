import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IClient, 
  ICreateClientPayload, 
  IUpdateClientPayload,
  ICompany,
  IClientCompany,
  ICreateClientCompanyPayload,
  IUpdateClientCompanyPayload,
  IClientAuth,
  IClientLoginRequest,
  IClientLoginResponse,
  IClientRefreshTokenRequest,
  IClientRefreshTokenResponse,
  IClientStats,
  IClientOverview,
  IClientActivity,
  IClientActivityFilter
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Clients Repository ---------------------------------------------------------

export const clientsRepository = {
  // List clients
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IClient>>('/api/access_control/clients', {
      params,
      revalidate: 120,
      tags: [accessControlTags.clients()],
    }),

  // Get client by ID
  getById: (id: string | number) => 
    serverFetch.get<IClient>(`/api/access_control/clients/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.client(id)],
    }),

  // Create client
  create: (payload: ICreateClientPayload) => 
    serverFetch.post<IClient>('/api/access_control/clients', payload, {
      revalidate: false,
    }),

  // Update client
  update: (id: string | number, payload: IUpdateClientPayload) => 
    serverFetch.put<IClient>(`/api/access_control/clients/${id}`, payload, {
      revalidate: false,
    }),

  // Delete client
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/clients/${id}`, {
      revalidate: false,
    }),

  // Get active clients
  getActive: () => 
    serverFetch.get<IClient[]>('/api/access_control/clients/active', {
      revalidate: 60,
      tags: [accessControlTags.clients()],
    }),
} as const;

// --- IClient-ICompany Relationships Repository ---------------------------------

export const clientCompaniesRepository = {
  // List client-companies
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IClientCompany>>('/api/access_control/client-companies', {
      params,
      revalidate: 120,
      tags: [accessControlTags.clients()],
    }),

  // Get client-company by IDs
  getById: (clientId: string | number, companyId: string | number) => 
    serverFetch.get<IClientCompany>(`/api/access_control/client-companies/${clientId}/${companyId}`, {
      revalidate: 300,
      tags: [accessControlTags.client(clientId)],
    }),

  // Get companies by client
  getCompaniesByClient: (clientId: string | number) => 
    serverFetch.get<ICompany[]>(`/api/access_control/client-companies/client/${clientId}`, {
      revalidate: 120,
      tags: [accessControlTags.client(clientId)],
    }),

  // Get clients by company
  getClientsByCompany: (companyId: string | number) => 
    serverFetch.get<IClient[]>(`/api/access_control/client-companies/company/${companyId}`, {
      revalidate: 300,
      tags: [accessControlTags.company(companyId)],
    }),

  // Get primary company for client
  getPrimaryCompany: (clientId: string | number) => 
    serverFetch.get<ICompany>(`/api/access_control/client-companies/client/${clientId}/primary`, {
      revalidate: 300,
      tags: [accessControlTags.client(clientId)],
    }),

  // Create client-company relationship
  create: (clientId: string | number, companyId: string | number, payload: ICreateClientCompanyPayload) => 
    serverFetch.post<IClientCompany>(`/api/access_control/client-companies/${clientId}/${companyId}`, payload, {
      revalidate: false,
    }),

  // Update client-company relationship
  update: (clientId: string | number, companyId: string | number, payload: IUpdateClientCompanyPayload) => 
    serverFetch.put<IClientCompany>(`/api/access_control/client-companies/${clientId}/${companyId}`, payload, {
      revalidate: false,
    }),

  // Delete client-company relationship
  delete: (clientId: string | number, companyId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/client-companies/${clientId}/${companyId}`, {
      revalidate: false,
    }),
} as const;

// --- IClient Authentication Repository -----------------------------------------

export const clientAuthRepository = {
  // IClient login
  login: (payload: IClientLoginRequest) => 
    serverFetch.post<IClientLoginResponse>('/api/access_control/auth/client/login', payload, {
      revalidate: false,
    }),

  // IClient refresh token
  refreshToken: (payload: IClientRefreshTokenRequest) => 
    serverFetch.post<IClientRefreshTokenResponse>('/api/access_control/auth/client/refresh', payload, {
      revalidate: false,
    }),

  // IClient logout
  logout: (token: string) => 
    serverFetch.post<void>('/api/access_control/auth/client/logout', { token }, {
      revalidate: false,
    }),

  // Get client auth info
  getAuthInfo: (clientId: string | number) => 
    serverFetch.get<IClientAuth>(`/api/access_control/auth/client/${clientId}`, {
      revalidate: 60,
      tags: [accessControlTags.client(clientId)],
    }),

  // Update client auth
  updateAuth: (clientId: string | number, payload: Partial<IClientAuth>) => 
    serverFetch.put<IClientAuth>(`/api/access_control/auth/client/${clientId}`, payload, {
      revalidate: false,
    }),
} as const;

// --- IClient Statistics Repository ---------------------------------------------

export const clientStatsRepository = {
  // Get client statistics
  getStats: (clientId: string | number) => 
    serverFetch.get<IClientStats>(`/api/access_control/clients/${clientId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.client(clientId)],
    }),

  // Get all clients statistics
  getAllStats: () => 
    serverFetch.get<IClientStats[]>('/api/access_control/clients/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.clients()],
    }),

  // Get client overview
  getOverview: (clientId: string | number) => 
    serverFetch.get<IClientOverview>(`/api/access_control/clients/${clientId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.client(clientId)],
    }),
} as const;

// --- IClient Activity Repository -----------------------------------------------

export const clientActivityRepository = {
  // List client activities
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IClientActivity>>('/api/access_control/client-activities', {
      params,
      revalidate: 120,
      tags: [accessControlTags.clients()],
    }),

  // Get activities by client
  getByClient: (clientId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IClientActivity>>(`/api/access_control/client-activities/client/${clientId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.client(clientId)],
    }),

  // Create activity log
  create: (activity: Omit<IClientActivity, 'id' | 'createdAt'>) => 
    serverFetch.post<IClientActivity>('/api/access_control/client-activities', activity, {
      revalidate: false,
    }),

  // Get recent activities
  getRecent: (clientId: string | number, limit: number = 10) => 
    serverFetch.get<IClientActivity[]>(`/api/access_control/client-activities/client/${clientId}/recent`, {
      params: { limit },
      revalidate: 60,
      tags: [accessControlTags.client(clientId)],
    }),
} as const;
