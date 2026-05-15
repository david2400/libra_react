import 'server-only';
import { IPermission } from '../permissions';
import { IMenu } from '../../navigation/menus';
import { IUser } from '../../account/users';
import { IRolePermission } from '../role_permissions';


export interface IRole {
  id_role: number;
  name: string;
  description: string;
  manage_users: boolean;
  requires_approval?: boolean;
  approval_workflow?: string;
  status: string;
  role_user?: IUser[];
  role_permission?: IRolePermission[];
  // Audit fields from AuditInfo
  created_at?: string;
  updated_at?: string;
}

export interface ICreateRolePayload {
  name: string;
  description: string;
  manage_users: boolean;
  requires_approval?: boolean;
  approval_workflow?: string;
  status: string;
}

export interface IUpdateRolePayload {
  name?: string;
  description?: string;
  manage_users?: boolean;
  requires_approval?: boolean;
  approval_workflow?: string;
  status?: string;
}



