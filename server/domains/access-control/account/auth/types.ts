import 'server-only';

// --- Authentication Types -------------------------------------------------

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: string;
  user: IUserInfo;
}

export interface IUserInfo {
  id: number;
  username: string;
  email?: string;
  company_id?: number;
  status: string;
  roles: string[];
  permissions: string[];
}

// --- Token Validation Types -----------------------------------------

export interface ITokenValidationRequest {
  token: string;
}

export interface ITokenValidationResponse {
  valid: boolean;
  user_id?: number;
  username?: string;
  email?: string;
  company_id?: number;
  status?: string;
  roles?: string[];
  permissions?: string[];
  expires_at?: string;
  error?: string;
}

// --- Token Refresh Types -----------------------------------------

export interface ITokenRefreshRequest {
  refresh_token: string;
}

export interface ITokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: string;
}

// --- Employee Authentication Types ---------------------------------

export interface IEmployeeLoginRequest {
  username: string;
  password: string;
  company_code?: string;
  remember_me?: boolean;
}

export interface IEmployeeLoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: string;
  user: IUserInfo;
}

// --- Client Authentication Types ---------------------------------

export interface IClientLoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface IClientLoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: string;
  user: IUserInfo;
}

// --- Health Check Types -----------------------------------------

export interface IHealthCheckResponse {
  status: string;
  timestamp: string;
  service: string;
}

// --- Internal Authentication Types -----------------------------

export interface IInternalLoginRequest {
  username: string;
  password: string;
}

export interface IInternalLoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: string;
  user: IUserInfo;
}

export interface ICredentialsValidationRequest {
  username: string;
  password: string;
}

export interface ICredentialsValidationResponse {
  valid: boolean;
  user_id?: number;
  username?: string;
  status?: string;
  error?: string;
}
