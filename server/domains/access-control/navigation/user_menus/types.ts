import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IUser-IMenu Relationship Types -------------------------------------

export interface IUserMenu {
  user_id: string | number;
  menu_id: string | number;
  access_level?: string;
  is_active?: boolean;
  expires_at?: string;
  override_role?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateUserMenuPayload {
  user_id: string | number;
  menu_id: string | number;
  access_level?: string;
  is_active?: boolean;
  expires_at?: string;
  override_role?: boolean;
}

export interface IUpdateUserMenuPayload {
  access_level?: string;
  is_active?: boolean;
  expires_at?: string;
  override_role?: boolean;
}

// --- IMenu Types (for user-menu management) -----------------------------

export interface IBulkUserMenuPayload {
  user_id: string | number;
  menu_ids: (string | number)[];
  access_level?: string;
  is_active?: boolean;
  expires_at?: string;
  override_role?: boolean;
}

export interface IBulkUserMenuResponse {
  successful: IUserMenu[];
  failed: Array<{
    menu_id: string | number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}
