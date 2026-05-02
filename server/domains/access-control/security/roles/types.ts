import 'server-only';

// --- IRole Types -------------------------------------------------------------

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

export interface ICreateRolePayload {
  name: string;
  description?: string;
  permission_ids?: (string | number)[];
  menu_ids?: (string | number)[];
}

export interface IUpdateRolePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
  permission_ids?: (string | number)[];
  menu_ids?: (string | number)[];
}

// --- IPermission Types (for role relationships) -----------------------------

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

// --- IMenu Types (for role relationships) -----------------------------------

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

// --- IRole-IMenu Relationships Types -----------------------------------------

export interface IRoleMenu {
  roleId: string | number;
  menuId: string | number;
  isActive?: boolean;
  role?: IRole;
  menu?: IMenu;
}

export interface ICreateRoleMenuPayload {
  roleId: string | number;
  menuId: string | number;
  isActive?: boolean;
}

export interface IUpdateRoleMenuPayload {
  isActive?: boolean;
}

// --- IRole-IPermission Relationships Types -----------------------------------

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

// --- Bulk Operations Types -------------------------------------------------

export interface IBulkRoleMenuPayload {
  roleId: string | number;
  menu_ids: (string | number)[];
  isActive?: boolean;
}
