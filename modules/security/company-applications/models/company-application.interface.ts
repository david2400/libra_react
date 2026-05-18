// Client-side interfaces for Company Applications
// These match the server types but are optimized for client usage

export interface ICompanyApplication {
  id_company_application: number;
  company_id: number;
  application_id: number;
  license_start_date: string;
  license_end_date: string;
  is_active: boolean;
  user_limit?: number;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
  company?: {
    id_company: number;
    name: string;
    description?: string;
    is_active?: boolean;
  };
  application?: {
    id_application: number;
    name: string;
    description?: string;
    route?: string;
    is_active?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ICompanyApplicationCreateRequest {
  company_id: number;
  application_id: number;
  license_start_date: string;
  license_end_date: string;
  is_active: boolean;
  user_limit?: number;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
}

export interface ICompanyApplicationUpdateRequest {
  id?: number;
  company_id?: number;
  application_id?: number;
  license_start_date?: string;
  license_end_date?: string;
  is_active?: boolean;
  user_limit?: number;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
}

export interface ICompany {
  id_company: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface IApplication {
  id_application: number;
  name: string;
  description?: string;
  route?: string;
  is_active?: boolean;
}
