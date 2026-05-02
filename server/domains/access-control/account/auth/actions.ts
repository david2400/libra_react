'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  authentication_repository,
  employee_authentication_repository,
  client_authentication_repository,
  internal_authentication_repository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ILoginRequest,
  ITokenValidationRequest,
  ITokenRefreshRequest,
  IEmployeeLoginRequest,
  IClientLoginRequest,
  IInternalLoginRequest,
  ICredentialsValidationRequest
} from './types';

// --- Authentication Actions -----------------------------------------

export const login_action = async (request: ILoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authentication_repository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Login failed',
        details: error
      }
    };
  }
};

export const validate_token_action = async (request: ITokenValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authentication_repository.validate_token(request);
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Token validation failed',
        details: error
      }
    };
  }
};

export const refresh_token_action = async (request: ITokenRefreshRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authentication_repository.refreshToken(request);
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Token refresh failed',
        details: error
      }
    };
  }
};

// --- Employee Authentication Actions -----------------------------

export const employee_login_action = async (request: IEmployeeLoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await employee_authentication_repository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Employee login failed',
        details: error
      }
    };
  }
};

// --- Client Authentication Actions -----------------------------

export const client_login_action = async (request: IClientLoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await client_authentication_repository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Client login failed',
        details: error
      }
    };
  }
};

// --- Internal Authentication Actions -----------------------------

export const internal_login_action = async (request: IInternalLoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await internal_authentication_repository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Internal login failed',
        details: error
      }
    };
  }
};

export const validate_credentials_action = async (request: ICredentialsValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await internal_authentication_repository.validate_credentials(request);
    
    return { success: true, data: response };
  } catch (error) {
    if (error instanceof ServerApiError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Credentials validation failed',
        details: error
      }
    };
  }
};
