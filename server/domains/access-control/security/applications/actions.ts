'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  applicationsRepository, 
  applicationModulesRepository,
  applicationHealthRepository,
  applicationConfigRepository,
  applicationStatsRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateApplicationPayload, 
  IUpdateApplicationPayload,
  ICreateApplicationModulePayload,
  IUpdateApplicationModulePayload,
  ICreateApplicationConfigPayload,
  IUpdateApplicationConfigPayload
} from './types';

// --- Applications Actions -----------------------------------------------------

export const createApplicationAction = async (payload: ICreateApplicationPayload): Promise<ActionResultType<any>> => {
  try {
    const application = await applicationsRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    if (typeof application.id === 'string' || typeof application.id === 'number') {
      await revalidateCacheTag(accessControlTags.application(application.id));
    }
    
    return { success: true, data: application };
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
        message: 'Failed to create application',
        details: error
      }
    };
  }
};

export const updateApplicationAction = async (id: string | number, payload: IUpdateApplicationPayload): Promise<ActionResultType<any>> => {
  try {
    const application = await applicationsRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(id));
    
    return { success: true, data: application };
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
        message: 'Failed to update application',
        details: error
      }
    };
  }
};

export const deleteApplicationAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await applicationsRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(id));
    
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
        message: 'Failed to delete application',
        details: error
      }
    };
  }
};

// --- IApplication-IModule Relationships Actions ---------------------------------

export const createApplicationModuleAction = async (applicationId: string | number, moduleId: string | number, payload: ICreateApplicationModulePayload): Promise<ActionResultType<any>> => {
  try {
    const applicationModule = await applicationModulesRepository.create(applicationId, moduleId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
    return { success: true, data: applicationModule };
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
        message: 'Failed to create application-module relationship',
        details: error
      }
    };
  }
};

export const updateApplicationModuleAction = async (applicationId: string | number, moduleId: string | number, payload: IUpdateApplicationModulePayload): Promise<ActionResultType<any>> => {
  try {
    const applicationModule = await applicationModulesRepository.update(applicationId, moduleId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
    return { success: true, data: applicationModule };
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
        message: 'Failed to update application-module relationship',
        details: error
      }
    };
  }
};

export const deleteApplicationModuleAction = async (applicationId: string | number, moduleId: string | number): Promise<ActionResultType<void>> => {
  try {
    await applicationModulesRepository.delete(applicationId, moduleId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
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
        message: 'Failed to delete application-module relationship',
        details: error
      }
    };
  }
};

// --- IApplication Configuration Actions -------------------------------------

export const createApplicationConfigAction = async (applicationId: string | number, payload: ICreateApplicationConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await applicationConfigRepository.create(applicationId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
    return { success: true, data: config };
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
        message: 'Failed to create application config',
        details: error
      }
    };
  }
};

export const updateApplicationConfigAction = async (applicationId: string | number, key: string, payload: IUpdateApplicationConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await applicationConfigRepository.update(applicationId, key, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
    return { success: true, data: config };
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
        message: 'Failed to update application config',
        details: error
      }
    };
  }
};

export const deleteApplicationConfigAction = async (applicationId: string | number, key: string): Promise<ActionResultType<void>> => {
  try {
    await applicationConfigRepository.delete(applicationId, key);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
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
        message: 'Failed to delete application config',
        details: error
      }
    };
  }
};
