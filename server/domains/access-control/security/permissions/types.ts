import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IPermission Types -------------------------------------------------------------

export interface IPermission {
  id: string | number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  isActive?: boolean;
}

// --- IMenu-IPermission Relationships Types (for permission management) -------------

export interface IMenu {
  id: string | number;
  name: string;
  label?: string;
  icon?: string;
  path?: string;
  parentId?: string | number;
  order?: number;
  isActive?: boolean;
  children?: IMenu[];
  permissions?: IPermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IMenuPermission {
  menuId: string | number;
  permissionId: string | number;
  isActive?: boolean;
  menu?: IMenu;
  permission?: IPermission;
}

export interface ICreateMenuPermissionPayload {
  menuId: string | number;
  permissionId: string | number;
  isActive?: boolean;
}

export interface IUpdateMenuPermissionPayload {
  isActive?: boolean;
}

// --- IRole-IPermission Relationships Types (for permission management) -----------

export interface IRole {
  id: string | number;
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: IPermission[];
  menus?: IMenu[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IRolePermission {
  roleId: string | number;
  permissionId: string | number;
  isActive?: boolean;
  role?: IRole;
  permission?: IPermission;
}

export interface ICreateRolePermissionPayload {
  roleId: string | number;
  permissionId: string | number;
  isActive?: boolean;
}

export interface IUpdateRolePermissionPayload {
  isActive?: boolean;
}

// --- IUser-IPermission Relationships Types (for permission management) -----------

export interface IUser {
  id: string | number;
  email: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  isActive?: boolean;
  roles?: IRole[];
  permissions?: IPermission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserPermission {
  userId: string | number;
  permissionId: string | number;
  isActive?: boolean;
  user?: IUser;
  permission?: IPermission;
}

export interface ICreateUserPermissionPayload {
  userId: string | number;
  permissionId: string | number;
  isActive?: boolean;
}

export interface IUpdateUserPermissionPayload {
  isActive?: boolean;
}
