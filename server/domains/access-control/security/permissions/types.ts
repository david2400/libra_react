import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';
import { IModuleApplication } from '../modules_applications';
import { IRolePermission } from '../role_permissions';

// --- IPermission Types -------------------------------------------------------------

export interface IPermission extends IAuditInfo {
  id_permission: number;
  name: string;
  description?: string;
  permission_type: 'API' | 'APPLICATION' | 'UI' | 'SYSTEM';
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'VIEW' | 'MANAGE' | 'ADMIN' | 'APPROVE' | 'REJECT';
  application_id?: number;
  application?: IApplication;
  module_id?: number;
  module?: IModuleApplication;
  api_type?: 'REST' | 'GraphQL' | 'gRPC' | 'SOAP' | 'WebSockets' | 'RPC (general)';
  http_method?: string;
  endpoint_path?: string;
  ui_component?: string;
  feature_flag?: string;
  priority?: number;
  cache_ttl?: number;
  is_sensitive?: boolean;
  metadata?: string;
  role_permission?: IRolePermission[];
}

export interface ICreatePermission {
  name: string;
  description?: string;
  permission_type: 'API' | 'APPLICATION' | 'UI' | 'SYSTEM';
  resource: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'VIEW' | 'MANAGE' | 'ADMIN' | 'APPROVE' | 'REJECT';
  application_id?: number;
  module_id?: number;
  api_type?: 'REST' | 'GraphQL' | 'gRPC' | 'SOAP' | 'WebSockets' | 'RPC (general)';
  http_method?: string;
  endpoint_path?: string;
  ui_component?: string;
  feature_flag?: string;
  priority?: number;
  cache_ttl?: number;
  is_sensitive?: boolean;
  metadata?: string;
}

export interface IUpdatePermission {
  name?: string;
  description?: string;
  permission_type?: 'API' | 'APPLICATION' | 'UI' | 'SYSTEM';
  resource?: string;
  action?: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXECUTE' | 'VIEW' | 'MANAGE' | 'ADMIN' | 'APPROVE' | 'REJECT';
  application_id?: number;
  module_id?: number;
  api_type?: 'REST' | 'GraphQL' | 'gRPC' | 'SOAP' | 'WebSockets' | 'RPC (general)';
  http_method?: string;
  endpoint_path?: string;
  ui_component?: string;
  feature_flag?: string;
  priority?: number;
  cache_ttl?: number;
  is_sensitive?: boolean;
  metadata?: string;
}
