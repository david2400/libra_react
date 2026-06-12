export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  children?: MenuItem[];
}

export interface Role {
  id: string;
  name: string;
  color: string;
  description: string;
}

export interface Permission {
  menuId: string;
  roleId: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}
