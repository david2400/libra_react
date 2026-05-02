import 'server-only';
import { cache } from 'react';

import { 
  authentication_repository,
  employee_authentication_repository,
  client_authentication_repository,
  internal_authentication_repository
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

export const validate_token = (request: ITokenValidationRequest) => 
  authentication_repository.validate_token(request);

export const refreshToken = (request: ITokenRefreshRequest) => 
  authentication_repository.refreshToken(request);

// --- Employee Authentication Queries -----------------------------

export const get_employee_health = cache(() => 
  employee_authentication_repository.health()
);

// --- Client Authentication Queries -----------------------------

export const get_client_health = cache(() => 
  client_authentication_repository.health()
);

// --- Internal Authentication Queries -----------------------------

export const get_internal_health = cache(() => 
  internal_authentication_repository.health()
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get authentication service status
export const get_authentication_service_status = cache(async () => {
  const [employeeHealth, clientHealth, internalHealth] = await Promise.all([
    get_employee_health(),
    get_client_health(),
    get_internal_health()
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
export const get_token_validation_with_user_info = async (request: ITokenValidationRequest) => {
  const validation = await validate_token(request);
  
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
export const get_authentication_metrics = cache(async () => {
  const [serviceStatus] = await Promise.all([
    get_authentication_service_status()
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
