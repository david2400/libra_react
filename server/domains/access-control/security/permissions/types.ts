import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';
import { IModuleApplication } from '../modules_applications';
import { IRolePermission } from '../role_permissions';

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

export interface IUpdatePermission extends ICreatePermission {
  id_permission: number;
}


export interface IPermission extends IAuditInfo, IUpdatePermission {
  application?: IApplication;
  module?: IModuleApplication;
  role_permission?: IRolePermission[];
}