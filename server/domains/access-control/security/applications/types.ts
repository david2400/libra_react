import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IApplication Types ---------------------------------------------------------

export interface IApplication {
  id: string | number;
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  base_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateApplicationPayload {
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  base_url?: string;
}

export interface IUpdateApplicationPayload {
  name?: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  base_url?: string;
  is_active?: boolean;
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
  application_id: string | number;
  module_id: string | number;
  is_active?: boolean;
  application?: IApplication;
  module?: IModule;
}

export interface ICreateApplicationModulePayload {
  application_id: string | number;
  module_id: string | number;
  is_active?: boolean;
}

export interface IUpdateApplicationModulePayload {
  is_active?: boolean;
}

// --- IApplication Health Types -------------------------------------------------

export interface IApplicationHealth {
  application_id: string | number;
  status: 'healthy' | 'unhealthy' | 'degraded';
  response_time?: number;
  last_checked: string;
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
  application_id: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateApplicationConfigPayload {
  application_id: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
}

export interface IUpdateApplicationConfigPayload {
  value?: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
}

// --- IApplication Statistics Types ---------------------------------------------

export interface IApplicationStats {
  application_id: string | number;
  total_users: number;
  active_sessions: number;
  requests_per_minute?: number;
  average_response_time?: number;
  error_rate?: number;
  last_updated: string;
}

export interface IApplicationOverview {
  application: IApplication;
  modules: IModule[];
  health: IApplicationHealth;
  stats: IApplicationStats;
  config_count: number;
}
