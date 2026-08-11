'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  authenticationRepository,
  employeeAuthenticationRepository,
  clientAuthenticationRepository,
  internalAuthenticationRepository
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

export const loginAction = async (request: ILoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authenticationRepository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

export const validateTokenAction = async (request: ITokenValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authenticationRepository.validateToken(request);
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

export const refreshTokenAction = async (request: ITokenRefreshRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await authenticationRepository.refreshToken(request);
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

// --- Employee Authentication Actions -----------------------------

export const employeeLoginAction = async (request: IEmployeeLoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await employeeAuthenticationRepository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

// --- Client Authentication Actions -----------------------------

export const clientLoginAction = async (request: IClientLoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await clientAuthenticationRepository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

// --- Internal Authentication Actions -----------------------------

export const internalLoginAction = async (request: IInternalLoginRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await internalAuthenticationRepository.login(request);
    
    // Revalidate cache tags for the user
    if (response.user.id) {
      await revalidateCacheTag(accessControlTags.user(response.user.id));
    }
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};

export const validateCredentialsAction = async (request: ICredentialsValidationRequest): Promise<ActionResultType<any>> => {
  try {
    const response = await internalAuthenticationRepository.validateCredentials(request);
    
    return { success: true, data: response };
  } catch (error) {
    throw error;
  }
};
