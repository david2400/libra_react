'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  applicationsRepository, 
  application_modules_repository,
  application_health_repository,
  application_config_repository,
  application_stats_repository
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

export const create_application_action = async (payload: ICreateApplicationPayload): Promise<ActionResultType<any>> => {
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

export const update_application_action = async (id: string | number, payload: IUpdateApplicationPayload): Promise<ActionResultType<any>> => {
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

export const delete_application_action = async (id: string | number): Promise<ActionResultType<void>> => {
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

export const create_application_module_action = async (applicationId: string | number, moduleId: string | number, payload: ICreateApplicationModulePayload): Promise<ActionResultType<any>> => {
  try {
    const applicationModule = await application_modules_repository.create(applicationId, moduleId, payload);
    
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

export const update_application_module_action = async (applicationId: string | number, moduleId: string | number, payload: IUpdateApplicationModulePayload): Promise<ActionResultType<any>> => {
  try {
    const applicationModule = await application_modules_repository.update(applicationId, moduleId, payload);
    
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

export const delete_application_module_action = async (applicationId: string | number, moduleId: string | number): Promise<ActionResultType<void>> => {
  try {
    await application_modules_repository.delete(applicationId, moduleId);
    
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

export const create_application_config_action = async (applicationId: string | number, payload: ICreateApplicationConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await application_config_repository.create(applicationId, payload);
    
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

export const update_application_config_action = async (applicationId: string | number, key: string, payload: IUpdateApplicationConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await application_config_repository.update(applicationId, key, payload);
    
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

export const delete_application_config_action = async (applicationId: string | number, key: string): Promise<ActionResultType<void>> => {
  try {
    await application_config_repository.delete(applicationId, key);
    
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
