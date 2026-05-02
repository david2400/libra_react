'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  modules_repository, 
  module_applications_repository,
  module_config_repository,
  module_activity_repository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateModulePayload, 
  IUpdateModulePayload,
  ICreateModuleApplicationPayload,
  IUpdateModuleApplicationPayload,
  ICreateModuleConfigPayload,
  IUpdateModuleConfigPayload,
  IModuleActivity
} from './types';

// --- Modules Actions ---------------------------------------------------------

export const create_module_action = async (payload: ICreateModulePayload): Promise<ActionResultType<any>> => {
  try {
    const module = await modules_repository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications()); // Using existing tags
    if (typeof module.id === 'string' || typeof module.id === 'number') {
      await revalidateCacheTag(accessControlTags.application(module.id));
    }
    
    // Log activity
    await module_activity_repository.create({
      moduleId: module.id,
      activityType: 'module_created',
      description: 'IModule created',
      metadata: { module_name: module.name }
    });
    
    return { success: true, data: module };
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
        message: 'Failed to create module',
        details: error
      }
    };
  }
};

export const update_module_action = async (id: string | number, payload: IUpdateModulePayload): Promise<ActionResultType<any>> => {
  try {
    const module = await modules_repository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(id));
    
    // Log activity
    await module_activity_repository.create({
      moduleId: id,
      activityType: 'module_updated',
      description: 'IModule updated',
      metadata: { updated_fields: Object.keys(payload) }
    });
    
    return { success: true, data: module };
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
        message: 'Failed to update module',
        details: error
      }
    };
  }
};

export const delete_module_action = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await modules_repository.delete(id);
    
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
        message: 'Failed to delete module',
        details: error
      }
    };
  }
};

// --- IModule-IApplication Relationships Actions ---------------------------------

export const create_module_application_action = async (moduleId: string | number, applicationId: string | number, payload: ICreateModuleApplicationPayload): Promise<ActionResultType<any>> => {
  try {
    const moduleApplication = await module_applications_repository.create(moduleId, applicationId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
    // Log activity
    await module_activity_repository.create({
      moduleId: moduleId,
      applicationId: applicationId,
      activityType: 'application_assigned',
      description: `IApplication assigned to module (IApplication ID: ${applicationId})`,
      metadata: { 
        applicationId: applicationId, 
        isActive: payload.isActive,
        configuration: payload.configuration
      }
    });
    
    return { success: true, data: moduleApplication };
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
        message: 'Failed to create module-application relationship',
        details: error
      }
    };
  }
};

export const update_module_application_action = async (moduleId: string | number, applicationId: string | number, payload: IUpdateModuleApplicationPayload): Promise<ActionResultType<any>> => {
  try {
    const moduleApplication = await module_applications_repository.update(moduleId, applicationId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));
    
    // Log activity
    await module_activity_repository.create({
      moduleId: moduleId,
      applicationId: applicationId,
      activityType: 'config_updated',
      description: `IModule-application relationship updated (IApplication ID: ${applicationId})`,
      metadata: { 
        applicationId: applicationId, 
        updated_fields: Object.keys(payload)
      }
    });
    
    return { success: true, data: moduleApplication };
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
        message: 'Failed to update module-application relationship',
        details: error
      }
    };
  }
};

export const delete_module_application_action = async (moduleId: string | number, applicationId: string | number): Promise<ActionResultType<void>> => {
  try {
    await module_applications_repository.delete(moduleId, applicationId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));
    await revalidateCacheTag(accessControlTags.application(applicationId));
    
    // Log activity
    await module_activity_repository.create({
      moduleId: moduleId,
      applicationId: applicationId,
      activityType: 'application_unassigned',
      description: `IApplication unassigned from module (IApplication ID: ${applicationId})`,
      metadata: { applicationId: applicationId }
    });
    
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
        message: 'Failed to delete module-application relationship',
        details: error
      }
    };
  }
};

// --- IModule Configuration Actions -----------------------------------------

export const create_module_config_action = async (moduleId: string | number, applicationId: string | number, payload: ICreateModuleConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await module_config_repository.create(moduleId, applicationId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));
    
    // Log activity
    await module_activity_repository.create({
      moduleId: moduleId,
      applicationId: applicationId,
      activityType: 'config_updated',
      description: `IModule configuration added (Key: ${payload.key})`,
      metadata: { 
        config_key: payload.key,
        is_encrypted: payload.is_encrypted
      }
    });
    
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
        message: 'Failed to create module config',
        details: error
      }
    };
  }
};

export const update_module_config_action = async (moduleId: string | number, applicationId: string | number, key: string, payload: IUpdateModuleConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await module_config_repository.update(moduleId, applicationId, key, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));
    
    // Log activity
    await module_activity_repository.create({
      moduleId: moduleId,
      applicationId: applicationId,
      activityType: 'config_updated',
      description: `IModule configuration updated (Key: ${key})`,
      metadata: { 
        config_key: key,
        updated_fields: Object.keys(payload)
      }
    });
    
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
        message: 'Failed to update module config',
        details: error
      }
    };
  }
};

export const delete_module_config_action = async (moduleId: string | number, applicationId: string | number, key: string): Promise<ActionResultType<void>> => {
  try {
    await module_config_repository.delete(moduleId, applicationId, key);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));
    
    // Log activity
    await module_activity_repository.create({
      moduleId: moduleId,
      applicationId: applicationId,
      activityType: 'config_updated',
      description: `IModule configuration deleted (Key: ${key})`,
      metadata: { config_key: key }
    });
    
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
        message: 'Failed to delete module config',
        details: error
      }
    };
  }
};

// --- IModule Activity Actions ---------------------------------------------

export const create_module_activity_action = async (activity: Omit<IModuleActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await module_activity_repository.create(activity);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(activity.moduleId));
    
    return { success: true, data: createdActivity };
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
        message: 'Failed to create module activity',
        details: error
      }
    };
  }
};
