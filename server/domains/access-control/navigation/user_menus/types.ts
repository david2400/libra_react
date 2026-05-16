import 'server-only';
import { IUser } from '../../account/users';
import { IMenu } from '../menus';
import { IAuditInfo } from '@/server/lib/types';

// --- IUser-IMenu Relationship Types -------------------------------------

export interface IUserMenu extends IAuditInfo {
  user_id: number;
  menu_id: number;
  access_level: string;
  is_active: boolean;
  expires_at?: string;
  override_role: boolean;
  user?: IUser;
  menu?: IMenu;
}

export interface ICreateUserMenuPayload {
  user_id: number;
  menu_id: number;
  access_level: string;
  is_active: boolean;
  expires_at?: string;
  override_role: boolean;
}

export interface IUpdateUserMenuPayload {
  access_level?: string;
  is_active?: boolean;
  expires_at?: string;
  override_role?: boolean;
}

// --- IMenu Types (for user-menu management) -----------------------------

export interface IBulkUserMenuPayload {
  user_id: number;
  menu_ids: number[];
  access_level: string;
  is_active: boolean;
  expires_at?: string;
  override_role: boolean;
}

export interface IBulkUserMenuResponse {
  successful: IUserMenu[];
  failed: Array<{
    menu_id: number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
