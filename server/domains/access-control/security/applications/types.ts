import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { ICompany } from '../../account/companies';
import { IPermission } from '../permissions';
import { IMenu } from '../../navigation/menus';

// --- IModuleApplication Types (temporary inline definition) -------------------

export interface IModuleApplication {
  id_module: number;
  name: string;
  description?: string;
  route?: string;
  icon?: string;
  is_active?: boolean;
}

// --- IApplication Types ---------------------------------------------------------

export interface IApplication extends IAuditInfo {
  id_application: number;
  name: string;
  description?: string;
  route: string;
  maintenance_mode: boolean;
  publication_date: string;
  company_id?: number;
}

export interface ICreateApplication {
  name: string;
  description?: string;
  route: string;
  maintenance_mode?: boolean;
  publication_date: string;
  company_id?: number;
}

export interface IUpdateApplication extends ICreateApplication {
  id_application: number;
}



// --- IApplication-IModule Relationships Types ---------------------------------

export interface IApplicationModule {
  application_id: string | number;
  module_id: string | number;
  is_active?: boolean;
  application?: IApplication;
  module?: IModuleApplication;
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
  modules: IModuleApplication[];
  health: IApplicationHealth;
  stats: IApplicationStats;
  config_count: number;
}
