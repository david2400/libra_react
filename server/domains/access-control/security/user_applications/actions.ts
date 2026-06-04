'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  userApplicationsRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateUserApplication, 
  IUpdateUserApplication,
} from './types';

// --- User Applications Actions -----------------------------------------------

export const createUserApplicationAction = async (payload: ICreateUserApplication): Promise<ActionResultType<any>> => {
  try {
    const userApplication = await userApplicationsRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    if (typeof userApplication.id_user_application === 'string' || typeof userApplication.id_user_application === 'number') {
      await revalidateCacheTag(accessControlTags.userApplication(userApplication.id_user_application));
    }
    
    return { success: true, data: userApplication };
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
        message: 'Failed to create user application',
        details: error
      }
    };
  }
};

export const updateUserApplicationAction = async (id: string | number, payload: IUpdateUserApplication): Promise<ActionResultType<any>> => {
  try {
    const userApplication = await userApplicationsRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    await revalidateCacheTag(accessControlTags.userApplication(id));
    
    return { success: true, data: userApplication };
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
        message: 'Failed to update user application',
        details: error
      }
    };
  }
};

export const deleteUserApplicationAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await userApplicationsRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    await revalidateCacheTag(accessControlTags.userApplication(id));
    
    return { success: true, data: undefined };
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
        message: 'Failed to delete user application',
        details: error
      }
    };
  }
};

// --- Assignment Actions -------------------------------------------------------

export const assignApplicationToUserAction = async (userId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const userApplication = await userApplicationsRepository.assignApplication(userId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    
    return { success: true, data: userApplication };
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
        message: 'Failed to assign application to user',
        details: error
      }
    };
  }
};

export const revokeApplicationFromUserAction = async (userId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await userApplicationsRepository.revokeApplication(userId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    
    return { success: true, data: result };
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
        message: 'Failed to revoke application from user',
        details: error
      }
    };
  }
};

// --- License Management Actions -----------------------------------------------

export const activateUserLicenseAction = async (userId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const userApplication = await userApplicationsRepository.activateLicense(userId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    
    return { success: true, data: userApplication };
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
        message: 'Failed to activate user license',
        details: error
      }
    };
  }
};

export const deactivateUserLicenseAction = async (userId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const userApplication = await userApplicationsRepository.deactivateLicense(userId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    
    return { success: true, data: userApplication };
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
        message: 'Failed to deactivate user license',
        details: error
      }
    };
  }
};

// --- Bulk Operations -----------------------------------------------------------

export const bulkAssignApplicationsAction = async (userId: string | number, applicationIds: (string | number)[]): Promise<ActionResultType<any>> => {
  try {
    const results = await Promise.allSettled(
      applicationIds.map(appId => userApplicationsRepository.assignApplication(userId, appId))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.userApplications());
    
    return {
      success: true,
      data: {
        total: applicationIds.length,
        successful,
        failed,
        results
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Failed to bulk assign applications',
        details: error
      }
    };
  }
};
