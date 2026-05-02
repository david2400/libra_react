import 'server-only';
import { cache } from 'react';

import { 
  authenticationRepository,
  employeeAuthenticationRepository,
  clientAuthenticationRepository,
  internalAuthenticationRepository
} from './repository';
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

// --- Authentication Queries -----------------------------------------

export const validateToken = (request: ITokenValidationRequest) => 
  authenticationRepository.validateToken(request);

export const refreshToken = (request: ITokenRefreshRequest) => 
  authenticationRepository.refreshToken(request);

// --- Employee Authentication Queries -----------------------------

export const getEmployeeHealth = cache(() => 
  employeeAuthenticationRepository.health()
);

// --- Client Authentication Queries -----------------------------

export const getClientHealth = cache(() => 
  clientAuthenticationRepository.health()
);

// --- Internal Authentication Queries -----------------------------

export const getInternalHealth = cache(() => 
  internalAuthenticationRepository.health()
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get authentication service status
export const getAuthenticationServiceStatus = cache(async () => {
  const [employeeHealth, clientHealth, internalHealth] = await Promise.all([
    getEmployeeHealth(),
    getClientHealth(),
    getInternalHealth()
  ]);
  
  return {
    employee: {
      status: employeeHealth.status,
      timestamp: employeeHealth.timestamp
    },
    client: {
      status: clientHealth.status,
      timestamp: clientHealth.timestamp
    },
    internal: {
      status: internalHealth.status,
      timestamp: internalHealth.timestamp
    },
    overall_status: [employeeHealth.status, clientHealth.status, internalHealth.status]
      .every(status => status === 'OK') ? 'OK' : 'DEGRADED'
  };
});

// Get token validation with user info
export const getTokenValidationWithUserInfo = async (request: ITokenValidationRequest) => {
  const validation = await validateToken(request);
  
  if (validation.valid && validation.userId) {
    // This would typically fetch additional user info
    return {
      ...validation,
      additional_info: {
        lastLogin: null, // Would come from user service
        session_duration: null, // Would be calculated
        device_info: null // Would come from session service
      }
    };
  }
  
  return validation;
};

// Get authentication metrics (mock implementation)
export const getAuthenticationMetrics = cache(async () => {
  const [serviceStatus] = await Promise.all([
    getAuthenticationServiceStatus()
  ]);
  
  return {
    service_status: serviceStatus,
    metrics: {
      total_logins_today: 0,
      successful_logins: 0,
      failed_logins: 0,
      activeSessions: 0,
      tokens_issued_today: 0,
      tokens_validated_today: 0
    },
    performance: {
      avg_response_time_ms: 0,
      max_response_time_ms: 0,
      error_rate_percent: 0
    }
  };
});
