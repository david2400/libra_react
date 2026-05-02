'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  profilesRepository, 
  profile_preferences_repository,
  profile_activity_repository,
  profile_stats_repository,
  profile_security_repository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateProfilePayload, 
  IUpdateProfilePayload,
  IUpdateProfilePreferencesPayload,
  IProfileActivity,
  IEnableTwoFactorPayload,
  IVerifyTwoFactorPayload,
  IAddTrustedDevicePayload
} from './types';

// --- Profiles Actions ---------------------------------------------------------

export const create_profile_action = async (payload: ICreateProfilePayload): Promise<ActionResultType<any>> => {
  try {
    const profile = await profilesRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.user(payload.userId));
    if (typeof profile.id === 'string' || typeof profile.id === 'number') {
      await revalidateCacheTag(accessControlTags.profile(profile.id));
    }
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profile.id,
      activityType: 'profile_update',
      description: 'IProfile created'
    });
    
    return { success: true, data: profile };
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
        message: 'Failed to create profile',
        details: error
      }
    };
  }
};

export const update_profile_action = async (id: string | number, payload: IUpdateProfilePayload): Promise<ActionResultType<any>> => {
  try {
    const profile = await profilesRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(id));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: id,
      activityType: 'profile_update',
      description: 'IProfile updated',
      metadata: { updated_fields: Object.keys(payload) }
    });
    
    return { success: true, data: profile };
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
        message: 'Failed to update profile',
        details: error
      }
    };
  }
};

export const delete_profile_action = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await profilesRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(id));
    
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
        message: 'Failed to delete profile',
        details: error
      }
    };
  }
};

// --- IProfile Preferences Actions ---------------------------------------------

export const update_profile_preferences_action = async (profileId: string | number, payload: IUpdateProfilePreferencesPayload): Promise<ActionResultType<any>> => {
  try {
    const preferences = await profile_preferences_repository.update(profileId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'preference_update',
      description: 'IProfile preferences updated',
      metadata: { updated_sections: Object.keys(payload) }
    });
    
    return { success: true, data: preferences };
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
        message: 'Failed to update profile preferences',
        details: error
      }
    };
  }
};

export const reset_profile_preferences_action = async (profileId: string | number): Promise<ActionResultType<any>> => {
  try {
    const preferences = await profile_preferences_repository.reset(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'preference_update',
      description: 'IProfile preferences reset to defaults'
    });
    
    return { success: true, data: preferences };
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
        message: 'Failed to reset profile preferences',
        details: error
      }
    };
  }
};

// --- IProfile Activity Actions ---------------------------------------------

export const create_profile_activity_action = async (activity: Omit<IProfileActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await profile_activity_repository.create(activity);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(activity.profile_id));
    
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
        message: 'Failed to create profile activity',
        details: error
      }
    };
  }
};

// --- IProfile Security Actions ---------------------------------------------

export const enable_two_factor_action = async (profileId: string | number, payload: IEnableTwoFactorPayload): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.enable_two_factor(profileId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: 'Two-factor authentication enabled'
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
        message: 'Failed to enable two-factor authentication',
        details: error
      }
    };
  }
};

export const verify_two_factor_action = async (profileId: string | number, payload: IVerifyTwoFactorPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await profile_security_repository.verify_two_factor(profileId, payload);
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: result.verified ? 'Two-factor authentication verified' : 'Two-factor authentication verification failed',
      metadata: { verified: result.verified }
    });
    
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
        message: 'Failed to verify two-factor authentication',
        details: error
      }
    };
  }
};

export const disable_two_factor_action = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.disable_two_factor(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: 'Two-factor authentication disabled'
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
        message: 'Failed to disable two-factor authentication',
        details: error
      }
    };
  }
};

export const generate_backup_codes_action = async (profileId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await profile_security_repository.generate_backup_codes(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: 'New backup codes generated'
    });
    
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
        message: 'Failed to generate backup codes',
        details: error
      }
    };
  }
};

export const add_trusted_device_action = async (profileId: string | number, payload: IAddTrustedDevicePayload): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.add_trusted_device(profileId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: 'Trusted device added',
      metadata: { device_name: payload.name }
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
        message: 'Failed to add trusted device',
        details: error
      }
    };
  }
};

export const remove_trusted_device_action = async (profileId: string | number, deviceId: string): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.remove_trusted_device(profileId, deviceId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: 'Trusted device removed',
      metadata: { device_id: deviceId }
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
        message: 'Failed to remove trusted device',
        details: error
      }
    };
  }
};

export const update_password_change_action = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.update_password_change(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'password_change',
      description: 'Password changed'
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
        message: 'Failed to update password change timestamp',
        details: error
      }
    };
  }
};

export const reset_failed_attempts_action = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.reset_failed_attempts(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: 'Failed login attempts reset'
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
        message: 'Failed to reset failed login attempts',
        details: error
      }
    };
  }
};

export const lock_profile_account_action = async (profileId: string | number, durationHours: number = 24): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.lock_account(profileId, durationHours);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: `Account locked for ${durationHours} hours`
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
        message: 'Failed to lock profile account',
        details: error
      }
    };
  }
};

export const unlock_profile_account_action = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profile_security_repository.unlock_account(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profile_activity_repository.create({
      profile_id: profileId,
      activityType: 'profile_update',
      description: 'Account unlocked'
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
        message: 'Failed to unlock profile account',
        details: error
      }
    };
  }
};
