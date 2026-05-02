import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IModule Types --------------------------------------------------------------

export interface IModule {
  id: string | number;
  name: string;
  description?: string;
  version?: string;
  status?: 'active' | 'inactive' | 'deprecated';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  isActive?: boolean;
}

// --- IApplication Types (for module management) --------------------------------

export interface IApplication {
  id: string | number;
  name: string;
  description?: string;
  version?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- IModule-IApplication Relationships Types -----------------------------------

export interface IModuleApplication {
  moduleId: string | number;
  applicationId: string | number;
  isActive?: boolean;
  priority?: number;
  module?: IModule;
  application?: IApplication;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateModuleApplicationPayload {
  moduleId: string | number;
  applicationId: string | number;
  isActive?: boolean;
  priority?: number;
}

export interface IUpdateModuleApplicationPayload {
  isActive?: boolean;
  priority?: number;
}

// --- IModule Dependencies Types ------------------------------------------------

export interface IModuleDependency {
  moduleId: string | number;
  dependsOnModuleId: string | number;
  version?: string;
  isRequired: boolean;
  module?: IModule;
  dependsOnModule?: IModule;
}

export interface ICreateModuleDependencyPayload {
  moduleId: string | number;
  dependsOnModuleId: string | number;
  version?: string;
  isRequired: boolean;
}

export interface IUpdateModuleDependencyPayload {
  version?: string;
  isRequired?: boolean;
}

// --- IModule Configuration Types -----------------------------------------------

export interface IModuleConfig {
  moduleId: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  isEncrypted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateModuleConfigPayload {
  moduleId: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  isEncrypted?: boolean;
}

export interface IUpdateModuleConfigPayload {
  value?: string | number | boolean;
  description?: string;
  isEncrypted?: boolean;
}

// --- IModule Statistics Types --------------------------------------------------

export interface IModuleStats {
  moduleId: string | number;
  totalApplications: number;
  activeApplications: number;
  totalDependencies: number;
  usageCount: number;
  lastUsed?: string;
  lastUpdated: string;
}

export interface IModuleOverview {
  module: IModule;
  applications: IApplication[];
  dependencies: IModuleDependency[];
  stats: IModuleStats;
  configCount: number;
}

// --- Bulk Operations Types ----------------------------------------------------

export interface IBulkModuleApplicationPayload {
  moduleId: string | number;
  applicationIds: (string | number)[];
  isActive?: boolean;
}

export interface IBulkModuleApplicationResponse {
  successful: IModuleApplication[];
  failed: Array<{
    applicationId: string | number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
