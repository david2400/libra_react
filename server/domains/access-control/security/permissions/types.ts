import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IPermission Types -------------------------------------------------------------

export interface IPermission {
  id: string | number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreatePermissionPayload {
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface IUpdatePermissionPayload {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  is_active?: boolean;
}
