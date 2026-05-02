import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  ILoginRequest,
  ILoginResponse,
  ITokenValidationRequest,
  ITokenValidationResponse,
  ITokenRefreshRequest,
  ITokenRefreshResponse,
  IEmployeeLoginRequest,
  IEmployeeLoginResponse,
  IClientLoginRequest,
  IClientLoginResponse,
  IHealthCheckResponse,
  IInternalLoginRequest,
  IInternalLoginResponse,
  ICredentialsValidationRequest,
  ICredentialsValidationResponse
} from './types';

// --- Authentication Repository -----------------------------------------

export const authenticationRepository = {
  // IUser login
  login: (request: ILoginRequest) => 
    serverFetch.post<ILoginResponse>('/api/access_control/auth/login', request, {
      revalidate: false,
    }),

  // Validate token
  validateToken: (request: ITokenValidationRequest) => 
    serverFetch.post<ITokenValidationResponse>('/api/access_control/auth/validate', request, {
      revalidate: false,
    }),

  // Refresh token
  refreshToken: (request: ITokenRefreshRequest) => 
    serverFetch.post<ITokenRefreshResponse>('/api/access_control/auth/refresh', request, {
      revalidate: false,
    }),
} as const;

// --- Employee Authentication Repository -----------------------------

export const employeeAuthenticationRepository = {
  // Employee login
  login: (request: IEmployeeLoginRequest) => 
    serverFetch.post<IEmployeeLoginResponse>('/api/access_control/auth/employee/login', request, {
      revalidate: false,
    }),

  // Health check
  health: () => 
    serverFetch.get<IHealthCheckResponse>('/api/access_control/auth/employee/health', {
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),
} as const;

// --- Client Authentication Repository -----------------------------

export const clientAuthenticationRepository = {
  // Client login
  login: (request: IClientLoginRequest) => 
    serverFetch.post<IClientLoginResponse>('/api/access_control/auth/client/login', request, {
      revalidate: false,
    }),

  // Health check
  health: () => 
    serverFetch.get<IHealthCheckResponse>('/api/access_control/auth/client/health', {
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),
} as const;

// --- Internal Authentication Repository -----------------------------

export const internalAuthenticationRepository = {
  // Internal login
  login: (request: IInternalLoginRequest) => 
    serverFetch.post<IInternalLoginResponse>('/api/access_control/api/internal/auth/login', request, {
      revalidate: false,
    }),

  // Validate credentials
  validateCredentials: (request: ICredentialsValidationRequest) => 
    serverFetch.post<ICredentialsValidationResponse>('/api/access_control/api/internal/auth/validate-credentials', request, {
      revalidate: false,
    }),

  // Health check
  health: () => 
    serverFetch.get<IHealthCheckResponse>('/api/access_control/api/internal/auth/health', {
      revalidate: 60,
      tags: [accessControlTags.authSession()],
    }),
} as const;
