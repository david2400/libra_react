import 'server-only';
import { IPermission } from '../permissions';
import { IMenu } from '../../navigation/menus';

// --- IRole Types -------------------------------------------------------------

export interface IRole {
  id: string | number;
  name: string;
  description?: string;
  is_active?: boolean;
  permissions?: IPermission[];
  menus?: IMenu[];
  created_at?: string;
  updated_at?: string;
}

export interface ICreateRolePayload {
  name: string;
  description?: string;
  permission_ids?: (string | number)[];
  menu_ids?: (string | number)[];
}

export interface IUpdateRolePayload {
  name?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: (string | number)[];
  menu_ids?: (string | number)[];
}


