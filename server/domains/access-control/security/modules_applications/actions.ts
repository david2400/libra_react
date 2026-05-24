'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import {
  modulesRepository,
  moduleApplicationsRepository,
  moduleConfigRepository,
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type {
  ICreateModuleApplication,
  IUpdateModuleApplication,
  ICreateModuleConfigPayload,
  IUpdateModuleConfigPayload,
} from './types';

// --- Modules Actions ---------------------------------------------------------

export const createModuleAction = async (payload: ICreateModuleApplication): Promise<ActionResultType<any>> => {
  try {
    const module = await modulesRepository.create(payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications()); // Using existing tags
    if (typeof module.id_modules_application === 'string' || typeof module.id_modules_application === 'number') {
      await revalidateCacheTag(accessControlTags.application(module.id_modules_application));
    }

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: module.id_modules_application,
    //   activity_type: 'module_created',
    //   description: 'IModule created',
    //   metadata: { module_name: module.name }
    // });

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

export const updateModuleAction = async (id: string | number, payload: IUpdateModuleApplication): Promise<ActionResultType<any>> => {
  try {
    const module = await modulesRepository.update(id, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(id));

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: id,
    //   activity_type: 'module_updated',
    //   description: 'IModule updated',
    //   metadata: { updated_fields: Object.keys(payload) }
    // });

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

export const deleteModuleAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await modulesRepository.delete(id);

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

export const createModuleApplicationAction = async (payload: ICreateModuleApplication): Promise<ActionResultType<any>> => {
  try {
    const moduleApplication = await moduleApplicationsRepository.create(payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: moduleId,
    //   activity_type: 'application_assigned',
    //   description: `IApplication assigned to module`,
    //   metadata: {
    //     is_active: payload.is_active,
    //     configuration: payload.configuration
    //   }
    // });

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

export const updateModuleApplicationAction = async (moduleId: string | number, payload: IUpdateModuleApplication): Promise<ActionResultType<any>> => {
  try {
    const moduleApplication = await moduleApplicationsRepository.update(moduleId, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: moduleId,
    //   activity_type: 'config_updated',
    //   description: `IModule-application relationship updated`,
    //   metadata: {
    //     updated_fields: Object.keys(payload)
    //   }
    // });

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

export const deleteModuleApplicationAction = async (moduleId: string | number): Promise<ActionResultType<void>> => {
  try {
    await moduleApplicationsRepository.delete(moduleId);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: moduleId,
    //   application_id: applicationId,
    //   activity_type: 'application_unassigned',
    //   description: `IApplication unassigned from module (IApplication ID: ${applicationId})`,
    //   metadata: { application_id: applicationId }
    // });

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

export const createModuleConfigAction = async (moduleId: string | number, payload: ICreateModuleConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await moduleConfigRepository.create(moduleId, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: moduleId,
    //   activity_type: 'config_updated',
    //   description: `IModule configuration added (Key: ${payload.key})`,
    //   metadata: {
    //     config_key: payload.key,
    //     is_encrypted: payload.is_encrypted
    //   }
    // });

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

export const updateModuleConfigAction = async (moduleId: string | number, key: string, payload: IUpdateModuleConfigPayload): Promise<ActionResultType<any>> => {
  try {
    const config = await moduleConfigRepository.update(moduleId, key, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: moduleId,
    //   activity_type: 'config_updated',
    //   description: `IModule configuration updated (Key: ${key})`,
    //   metadata: {
    //     config_key: key,
    //     updated_fields: Object.keys(payload)
    //   }
    // });

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

export const deleteModuleConfigAction = async (moduleId: string | number, key: string): Promise<ActionResultType<void>> => {
  try {
    await moduleConfigRepository.delete(moduleId, key);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.applications());
    await revalidateCacheTag(accessControlTags.application(moduleId));

    // Log activity
    // await moduleActivityRepository.create({
    //   module_id: moduleId,
    //   activity_type: 'config_updated',
    //   description: `IModule configuration deleted (Key: ${key})`,
    //   metadata: { config_key: key }
    // });

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

// export const createModuleActivityAction = async (activity: Omit<IModuleActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
//   try {
//     const createdActivity = await moduleActivityRepository.create(activity);

//     // Revalidate cache tags
//     await revalidateCacheTag(accessControlTags.applications());
//     await revalidateCacheTag(accessControlTags.application(activity.moduleId));

//     return { success: true, data: createdActivity };
//   } catch (error) {
//     if (error instanceof ServerApiError) {
//       return {
//         success: false,
//         error: {
//           message: error.message,
//           code: error.code,
//           details: error.details
//         }
//       };
//     }

//     return {
//       success: false,
//       error: {
//         message: 'Failed to create module activity',
//         details: error
//       }
//     };
//   }
// };
