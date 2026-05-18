import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IApplication, 
  ICreateApplication, 
  IUpdateApplication,
  IApplicationModule,
  ICreateApplicationModulePayload,
  IUpdateApplicationModulePayload,
  IApplicationHealth,
  IHealthCheckResponse,
  IBulkHealthCheckResponse,
  IApplicationConfig,
  ICreateApplicationConfigPayload,
  IUpdateApplicationConfigPayload,
  IApplicationStats,
  IApplicationOverview
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IModule } from '../modules_applications';

// --- Applications Repository -----------------------------------------------------

export const applicationsRepository = {
  // List applications
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IApplication>>('/api/access_control/applications', {
      params,
      revalidate: 120,
      tags: [accessControlTags.applications()],
    }),

  // Get application by ID
  getById: (id: string | number) => 
    serverFetch.get<IApplication>(`/api/access_control/applications/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.application(id)],
    }),

  // Create application
  create: (payload: ICreateApplication) => 
    serverFetch.post<IApplication>('/api/access_control/applications', payload, {
      revalidate: false,
    }),

  // Update application
  update: (id: string | number, payload: IUpdateApplication) => 
    serverFetch.put<IApplication>(`/api/access_control/applications/${id}`, payload, {
      revalidate: false,
    }),

  // Delete application
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/applications/${id}`, {
      revalidate: false,
    }),

  // Get active applications
  getActive: () => 
    serverFetch.get<IApplication[]>('/api/access_control/applications/active', {
      revalidate: 60,
      tags: [accessControlTags.applications()],
    }),
} as const;

// --- IApplication-IModule Relationships Repository -----------------------------

export const applicationModulesRepository = {
  // List application-modules
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IApplicationModule>>('/api/access_control/application-modules', {
      params,
      revalidate: 120,
      tags: [accessControlTags.applicationModules()],
    }),

  // Get application-module by IDs
  getById: (applicationId: string | number, moduleId: string | number) => 
    serverFetch.get<IApplicationModule>(`/api/access_control/application-modules/${applicationId}/${moduleId}`, {
      revalidate: 300,
      tags: [accessControlTags.applicationModule(applicationId, moduleId)],
    }),

  // Get modules by application
  getModulesByApplication: (applicationId: string | number) => 
    serverFetch.get<IModule[]>(`/api/access_control/application-modules/application/${applicationId}`, {
      revalidate: 120,
      tags: [accessControlTags.application(applicationId)],
    }),

  // Get applications by module
  getApplicationsByModule: (moduleId: string | number) => 
    serverFetch.get<IApplication[]>(`/api/access_control/application-modules/module/${moduleId}`, {
      revalidate: 300,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Create application-module relationship
  create: (applicationId: string | number, moduleId: string | number, payload: ICreateApplicationModulePayload) => 
    serverFetch.post<IApplicationModule>(`/api/access_control/application-modules/${applicationId}/${moduleId}`, payload, {
      revalidate: false,
    }),

  // Update application-module relationship
  update: (applicationId: string | number, moduleId: string | number, payload: IUpdateApplicationModulePayload) => 
    serverFetch.put<IApplicationModule>(`/api/access_control/application-modules/${applicationId}/${moduleId}`, payload, {
      revalidate: false,
    }),

  // Delete application-module relationship
  delete: (applicationId: string | number, moduleId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/application-modules/${applicationId}/${moduleId}`, {
      revalidate: false,
    }),
} as const;

// --- IApplication Health Repository ---------------------------------------------

export const applicationHealthRepository = {
  // Check single application health
  checkHealth: (applicationId: string | number) => 
    serverFetch.get<IHealthCheckResponse>(`/api/access_control/applications/${applicationId}/health`, {
      revalidate: 30,
      tags: [accessControlTags.applicationHealth(applicationId)],
    }),

  // Check all applications health
  checkAllHealth: () => 
    serverFetch.get<IBulkHealthCheckResponse>('/api/access_control/applications/health/bulk', {
      revalidate: 30,
      tags: [accessControlTags.applications()],
    }),

  // Get health history
  getHealthHistory: (applicationId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IApplicationHealth>>(`/api/access_control/applications/${applicationId}/health/history`, {
      params,
      revalidate: 300,
      tags: [accessControlTags.applicationHealth(applicationId)],
    }),
} as const;

// --- IApplication Configuration Repository -------------------------------------

export const applicationConfigRepository = {
  // List application configs
  list: (applicationId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IApplicationConfig>>(`/api/access_control/applications/${applicationId}/config`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.applicationConfig(applicationId)],
    }),

  // Get config by key
  getByKey: (applicationId: string | number, key: string) => 
    serverFetch.get<IApplicationConfig>(`/api/access_control/applications/${applicationId}/config/${key}`, {
      revalidate: 300,
      tags: [accessControlTags.applicationConfig(applicationId)],
    }),

  // Create config
  create: (applicationId: string | number, payload: ICreateApplicationConfigPayload) => 
    serverFetch.post<IApplicationConfig>(`/api/access_control/applications/${applicationId}/config`, payload, {
      revalidate: false,
    }),

  // Update config
  update: (applicationId: string | number, key: string, payload: IUpdateApplicationConfigPayload) => 
    serverFetch.put<IApplicationConfig>(`/api/access_control/applications/${applicationId}/config/${key}`, payload, {
      revalidate: false,
    }),

  // Delete config
  delete: (applicationId: string | number, key: string) => 
    serverFetch.delete<void>(`/api/access_control/applications/${applicationId}/config/${key}`, {
      revalidate: false,
    }),
} as const;

// --- IApplication Statistics Repository ---------------------------------------

export const applicationStatsRepository = {
  // Get application statistics
  getStats: (applicationId: string | number) => 
    serverFetch.get<IApplicationStats>(`/api/access_control/applications/${applicationId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.applicationStats(applicationId)],
    }),

  // Get all applications statistics
  getAllStats: () => 
    serverFetch.get<IApplicationStats[]>('/api/access_control/applications/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.applications()],
    }),

  // Get application overview
  getOverview: (applicationId: string | number) => 
    serverFetch.get<IApplicationOverview>(`/api/access_control/applications/${applicationId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.application(applicationId)],
    }),
} as const;
