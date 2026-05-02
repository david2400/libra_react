import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IApplication Types ---------------------------------------------------------

export interface IApplication {
  id: string | number;
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  baseUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateApplicationPayload {
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  baseUrl?: string;
}

export interface IUpdateApplicationPayload {
  name?: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  baseUrl?: string;
  isActive?: boolean;
}

// --- IModule Types (for application management) -------------------------------

export interface IModule {
  id: string | number;
  name: string;
  description?: string;
  version?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- IApplication-IModule Relationships Types ---------------------------------

export interface IApplicationModule {
  applicationId: string | number;
  moduleId: string | number;
  isActive?: boolean;
  application?: IApplication;
  module?: IModule;
}

export interface ICreateApplicationModulePayload {
  applicationId: string | number;
  moduleId: string | number;
  isActive?: boolean;
}

export interface IUpdateApplicationModulePayload {
  isActive?: boolean;
}

// --- IApplication Health Types -------------------------------------------------

export interface IApplicationHealth {
  applicationId: string | number;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  details?: Record<string, unknown>;
}

export interface IApplicationHealthCheck {
  application: IApplication;
  health: IApplicationHealth;
}

export interface IApplicationHealthReport {
  results: IApplicationHealthCheck[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

// --- IApplication Configuration Types -----------------------------------------

export interface IApplicationConfig {
  applicationId: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  isEncrypted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateApplicationConfigPayload {
  applicationId: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  isEncrypted?: boolean;
}

export interface IUpdateApplicationConfigPayload {
  value?: string | number | boolean;
  description?: string;
  isEncrypted?: boolean;
}

// --- IApplication Statistics Types ---------------------------------------------

export interface IApplicationStats {
  applicationId: string | number;
  totalUsers: number;
  activeSessions: number;
  requestsPerMinute?: number;
  averageResponseTime?: number;
  errorRate?: number;
  lastUpdated: string;
}

export interface IApplicationOverview {
  application: IApplication;
  modules: IModule[];
  health: IApplicationHealth;
  stats: IApplicationStats;
  configCount: number;
}
