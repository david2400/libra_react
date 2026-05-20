'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  companyApplicationsRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateCompanyApplicationPayload, 
  IUpdateCompanyApplicationPayload,
} from './types';

// --- Company Applications Actions -----------------------------------------------

export const createCompanyApplicationAction = async (payload: ICreateCompanyApplicationPayload): Promise<ActionResultType<any>> => {
  try {
    const companyApplication = await companyApplicationsRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companyApplications());
    if (typeof companyApplication.id_company_application === 'string' || typeof companyApplication.id_company_application === 'number') {
      await revalidateCacheTag(accessControlTags.companyApplication(companyApplication.id_company_application));
    }
    
    return { success: true, data: companyApplication };
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
        message: 'Failed to create company application',
        details: error
      }
    };
  }
};

export const updateCompanyApplicationAction = async (id: string | number, payload: IUpdateCompanyApplicationPayload): Promise<ActionResultType<any>> => {
  try {
    const companyApplication = await companyApplicationsRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companyApplications());
    await revalidateCacheTag(accessControlTags.companyApplication(id));
    
    return { success: true, data: companyApplication };
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
        message: 'Failed to update company application',
        details: error
      }
    };
  }
};

export const deleteCompanyApplicationAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await companyApplicationsRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companyApplications());
    await revalidateCacheTag(accessControlTags.companyApplication(id));
    
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
        message: 'Failed to delete company application',
        details: error
      }
    };
  }
};

// --- License Management Actions -----------------------------------------------

export const activateLicenseAction = async (companyId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await companyApplicationsRepository.activateLicense(companyId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companyApplications());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
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
        message: 'Failed to activate license',
        details: error
      }
    };
  }
};

export const deactivateLicenseAction = async (companyId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await companyApplicationsRepository.deactivateLicense(companyId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companyApplications());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
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
        message: 'Failed to deactivate license',
        details: error
      }
    };
  }
};

// --- Assignment Management Actions ----------------------------------------------

export const assignApplicationToCompanyAction = async (companyId: string | number, applicationId: string | number, payload?: ICreateCompanyApplicationPayload): Promise<ActionResultType<any>> => {
  try {
    let result;
    
    if (payload) {
      // Use full payload for detailed assignment
      result = await companyApplicationsRepository.create(payload);
    } else {
      // Use quick assign endpoint
      result = await companyApplicationsRepository.assignApplication(companyId, applicationId);
    }
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companyApplications());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
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
        message: 'Failed to assign application to company',
        details: error
      }
    };
  }
};

export const revokeApplicationFromCompanyAction = async (companyId: string | number, applicationId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await companyApplicationsRepository.revokeApplication(companyId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companyApplications());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
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
        message: 'Failed to revoke application from company',
        details: error
      }
    };
  }
};
