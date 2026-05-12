import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { IApplication } from '@/modules/security/applications/models/application.interface';

// --- IModule Types --------------------------------------------------------------

export interface IModule {
  id: string | number;
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'deprecated';
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateModulePayload {
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'deprecated';
}

export interface IUpdateModulePayload {
  name?: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'deprecated';
  is_active?: boolean;
}

export interface IModuleApplication {
  module_id: string | number;
  application_id: string | number;
  is_active?: boolean;
  priority?: number;
  module?: IModule;
  application?: IApplication;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateModuleApplicationPayload {
  module_id: string | number;
  application_id: string | number;
  is_active?: boolean;
  priority?: number;
}

export interface IUpdateModuleApplicationPayload {
  is_active?: boolean;
  priority?: number;
}

// --- IModule Dependencies Types ------------------------------------------------

export interface IModuleDependency {
  module_id: string | number;
  depends_on_module_id: string | number;
  version?: string;
  is_required: boolean;
  module?: IModule;
  depends_on_module?: IModule;
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

// --- IModule Configuration Types -----------------------------------------------

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

// --- IModule Statistics Types --------------------------------------------------

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
  module: IModule;
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
