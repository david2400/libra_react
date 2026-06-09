/** @format */

export interface IUserCompany {
  user_id: number;
  company_id: number;
  is_primary: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface IUserCompanyCreateRequest {
  user_id: number;
  company_id: number;
  is_primary?: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
}

export interface IUserCompanyUpdateRequest {
  user_id: number;
  company_id: number;
  is_primary?: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
}

export interface IUserCompanyWithDetails extends IUserCompany {
  user_name?: string;
  company_name?: string;
  company_nit?: string;
}
