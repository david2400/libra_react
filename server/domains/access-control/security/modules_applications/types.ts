import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IApplication } from '@/modules/security/applications/models/application.interface';
import { IAuditInfo } from '@/server/lib/types';

// --- IModuleApplication Types --------------------------------------------------------------
export interface ICreateModuleApplication {
  name: string;
  description?: string;
  application_id: number;
  parent_module_application_id?: number;
  publication_date?: Date;
  level?: number;
  path?: string;
}

export interface IUpdateModuleApplication extends ICreateModuleApplication {
  id_modules_application: number;
}

export interface IModuleApplication extends IAuditInfo, IUpdateModuleApplication {
  parent_module_application: IModuleApplication[];
  application: IApplication;
}



export interface IModuleDependency {
  module_id: string | number;
  depends_on_module_id: string | number;
  version?: string;
  is_required: boolean;
  module?: IModuleApplication;
  depends_on_module?: IModuleApplication;
}

export interface ICreateModuleDependencyPayload {
  module_id: string | number;
  depends_on_module_id: string | number;
  version?: string;
  is_required: boolean;
}

export interface IUpdateModuleDependencyPayload {
  version?: string;
  is_required?: boolean;
}

// --- IModuleApplication Configuration Types -----------------------------------------------

export interface IModuleConfig {
  module_id: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateModuleConfigPayload {
  module_id: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
}

export interface IUpdateModuleConfigPayload {
  value?: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
}

// --- IModuleApplication Statistics Types --------------------------------------------------

export interface IModuleStats {
  module_id: string | number;
  total_applications: number;
  active_applications: number;
  total_dependencies: number;
  usage_count: number;
  last_used?: string;
  last_updated: string;
}

export interface IModuleOverview {
  module: IModuleApplication;
  applications: IApplication[];
  dependencies: IModuleDependency[];
  stats: IModuleStats;
  config_count: number;
}

// --- Bulk Operations Types ----------------------------------------------------

export interface IBulkModuleApplicationPayload {
  module_id: string | number;
  application_ids: (string | number)[];
  is_active?: boolean;
}

export interface IBulkModuleApplicationResponse {
  successful: IModuleApplication[];
  failed: Array<{
    application_id: string | number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
