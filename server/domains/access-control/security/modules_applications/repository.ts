import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IModule, 
  ICreateModulePayload, 
  IUpdateModulePayload,
  IApplication,
  IModuleApplication,
  ICreateModuleApplicationPayload,
  IUpdateModuleApplicationPayload,
  IModuleStats,
  IModuleOverview,
  IModuleConfig,
  ICreateModuleConfigPayload,
  IUpdateModuleConfigPayload,
  IModuleActivity,
  IModuleActivityFilter,
  IModuleHealth,
  IModuleHealthResponse,
  IBulkModuleHealthResponse
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Modules Repository -----------------------------------------------------

export const modulesRepository = {
  // List modules
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IModule>>('/api/access_control/modules', {
      params,
      revalidate: 120,
      tags: [accessControlTags.modules()],
    }),

  // Get module by ID
  getById: (id: string | number) => 
    serverFetch.get<IModule>(`/api/access_control/modules/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.module(id)],
    }),

  // Create module
  create: (payload: ICreateModulePayload) => 
    serverFetch.post<IModule>('/api/access_control/modules', payload, {
      revalidate: false,
    }),

  // Update module
  update: (id: string | number, payload: IUpdateModulePayload) => 
    serverFetch.put<IModule>(`/api/access_control/modules/${id}`, payload, {
      revalidate: false,
    }),

  // Delete module
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/modules/${id}`, {
      revalidate: false,
    }),

  // Get active modules
  getActive: () => 
    serverFetch.get<IModule[]>('/api/access_control/modules/active', {
      revalidate: 60,
      tags: [accessControlTags.modules()],
    }),
} as const;

// --- IModule-IApplication Relationships Repository -----------------------------

export const moduleApplicationsRepository = {
  // List module-applications
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IModuleApplication>>('/api/access_control/module-applications', {
      params,
      revalidate: 120,
      tags: [accessControlTags.modules()],
    }),

  // Get module-application by IDs
  getById: (moduleId: string | number, applicationId: string | number) => 
    serverFetch.get<IModuleApplication>(`/api/access_control/module-applications/${moduleId}/${applicationId}`, {
      revalidate: 300,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Get applications by module
  getApplicationsByModule: (moduleId: string | number) => 
    serverFetch.get<IApplication[]>(`/api/access_control/module-applications/module/${moduleId}`, {
      revalidate: 120,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Get modules by application
  getModulesByApplication: (applicationId: string | number) => 
    serverFetch.get<IModule[]>(`/api/access_control/module-applications/application/${applicationId}`, {
      revalidate: 300,
      tags: [accessControlTags.application(applicationId)],
    }),

  // Get active applications for module
  getActiveApplications: (moduleId: string | number) => 
    serverFetch.get<IApplication[]>(`/api/access_control/module-applications/module/${moduleId}/active`, {
      revalidate: 120,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Create module-application relationship
  create: (moduleId: string | number, applicationId: string | number, payload: ICreateModuleApplicationPayload) => 
    serverFetch.post<IModuleApplication>(`/api/access_control/module-applications/${moduleId}/${applicationId}`, payload, {
      revalidate: false,
    }),

  // Update module-application relationship
  update: (moduleId: string | number, applicationId: string | number, payload: IUpdateModuleApplicationPayload) => 
    serverFetch.put<IModuleApplication>(`/api/access_control/module-applications/${moduleId}/${applicationId}`, payload, {
      revalidate: false,
    }),

  // Delete module-application relationship
  delete: (moduleId: string | number, applicationId: string | number) => 
    serverFetch.delete<void>(`/api/access_control/module-applications/${moduleId}/${applicationId}`, {
      revalidate: false,
    }),
} as const;

// --- IModule Statistics Repository -------------------------------------------

export const moduleStatsRepository = {
  // Get module statistics
  getStats: (moduleId: string | number) => 
    serverFetch.get<IModuleStats>(`/api/access_control/modules/${moduleId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Get all modules statistics
  getAllStats: () => 
    serverFetch.get<IModuleStats[]>('/api/access_control/modules/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.modules()],
    }),

  // Get module overview
  getOverview: (moduleId: string | number) => 
    serverFetch.get<IModuleOverview>(`/api/access_control/modules/${moduleId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.module(moduleId)],
    }),
} as const;

// --- IModule Configuration Repository -----------------------------------------

export const moduleConfigRepository = {
  // List module configs
  list: (moduleId: string | number, applicationId?: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IModuleConfig>>(
      applicationId 
        ? `/api/access_control/modules/${moduleId}/applications/${applicationId}/config`
        : `/api/access_control/modules/${moduleId}/config`, 
      {
        params,
        revalidate: 120,
        tags: [accessControlTags.module(moduleId)],
      }
    ),

  // Get config by key
  getByKey: (moduleId: string | number, applicationId: string | number, key: string) => 
    serverFetch.get<IModuleConfig>(`/api/access_control/modules/${moduleId}/applications/${applicationId}/config/${key}`, {
      revalidate: 300,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Create config
  create: (moduleId: string | number, applicationId: string | number, payload: ICreateModuleConfigPayload) => 
    serverFetch.post<IModuleConfig>(`/api/access_control/modules/${moduleId}/applications/${applicationId}/config`, payload, {
      revalidate: false,
    }),

  // Update config
  update: (moduleId: string | number, applicationId: string | number, key: string, payload: IUpdateModuleConfigPayload) => 
    serverFetch.put<IModuleConfig>(`/api/access_control/modules/${moduleId}/applications/${applicationId}/config/${key}`, payload, {
      revalidate: false,
    }),

  // Delete config
  delete: (moduleId: string | number, applicationId: string | number, key: string) => 
    serverFetch.delete<void>(`/api/access_control/modules/${moduleId}/applications/${applicationId}/config/${key}`, {
      revalidate: false,
    }),
} as const;

// --- IModule Activity Repository ---------------------------------------------

export const moduleActivityRepository = {
  // List module activities
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IModuleActivity>>('/api/access_control/module-activities', {
      params,
      revalidate: 120,
      tags: [accessControlTags.modules()],
    }),

  // Get activities by module
  getByModule: (moduleId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IModuleActivity>>(`/api/access_control/module-activities/module/${moduleId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Create activity log
  create: (activity: Omit<IModuleActivity, 'id' | 'createdAt'>) => 
    serverFetch.post<IModuleActivity>('/api/access_control/module-activities', activity, {
      revalidate: false,
    }),

  // Get recent activities
  getRecent: (moduleId: string | number, limit: number = 10) => 
    serverFetch.get<IModuleActivity[]>(`/api/access_control/module-activities/module/${moduleId}/recent`, {
      params: { limit },
      revalidate: 60,
      tags: [accessControlTags.module(moduleId)],
    }),
} as const;

// --- IModule Health Repository ---------------------------------------------

export const moduleHealthRepository = {
  // Check module health
  checkHealth: (moduleId: string | number) => 
    serverFetch.get<IModuleHealthResponse>(`/api/access_control/modules/${moduleId}/health`, {
      revalidate: 30,
      tags: [accessControlTags.module(moduleId)],
    }),

  // Check all modules health
  checkAllHealth: () => 
    serverFetch.get<IBulkModuleHealthResponse>('/api/access_control/modules/health/bulk', {
      revalidate: 30,
      tags: [accessControlTags.modules()],
    }),

  // Get health history
  getHealthHistory: (moduleId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IModuleHealth>>(`/api/access_control/modules/${moduleId}/health/history`, {
      params,
      revalidate: 300,
      tags: [accessControlTags.module(moduleId)],
    }),
} as const;
