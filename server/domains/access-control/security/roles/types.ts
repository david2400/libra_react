import 'server-only';
import { IPermission } from '../permissions';
import { IMenu } from '../../navigation/menus';
import { IUser } from '../../account/users';
import { IRolePermission } from '../role_permissions';
import { IAuditInfo } from '@/server/lib/types';


export interface IRole extends IAuditInfo {
  id_role: number;
  name: string;
  description: string;
  manage_users: boolean;
  requires_approval?: boolean;
  approval_workflow?: any;
  role_user?: IUser[];
  role_permission?: IRolePermission[];
}

export interface ICreateRole {
  name: string;
  description: string;
  manage_users: boolean;
  requires_approval?: boolean;
  approval_workflow?: JSON;
}

export interface IUpdateRole extends ICreateRole {
  id_role: number;
}



