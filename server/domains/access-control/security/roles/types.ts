import 'server-only';
import { IUser } from '../../account/users';
import { IRolePermission } from '../role_permissions';
import { IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';

export interface ICreateRole {
  name: string;
  description: string;
  manage_users: boolean;
  application_id: number;
  requires_approval?: boolean;
  approval_workflow?: JSON;
}

export interface IUpdateRole extends ICreateRole {
  id_role: number;
}

export interface IRole extends IAuditInfo, IUpdateRole {
  role_user?: IUser[];
  role_permission?: IRolePermission[];
  application?: IApplication[];
}



