'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  profilesRepository, 
  profilePreferencesRepository,
  profileActivityRepository,
  profileStatsRepository,
  profileSecurityRepository
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

export const createProfileAction = async (payload: ICreateProfilePayload): Promise<ActionResultType<any>> => {
  try {
    const profile = await profilesRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.user(payload.userId));
    if (typeof profile.id === 'string' || typeof profile.id === 'number') {
      await revalidateCacheTag(accessControlTags.profile(profile.id));
    }
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profile.id,
      activity_type: 'profile_update',
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

export const updateProfileAction = async (id: string | number, payload: IUpdateProfilePayload): Promise<ActionResultType<any>> => {
  try {
    const profile = await profilesRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(id));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: id,
      activity_type: 'profile_update',
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

export const deleteProfileAction = async (id: string | number): Promise<ActionResultType<void>> => {
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

export const updateProfilePreferencesAction = async (profileId: string | number, payload: IUpdateProfilePreferencesPayload): Promise<ActionResultType<any>> => {
  try {
    const preferences = await profilePreferencesRepository.update(profileId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'preference_update',
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

export const resetProfilePreferencesAction = async (profileId: string | number): Promise<ActionResultType<any>> => {
  try {
    const preferences = await profilePreferencesRepository.reset(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'preference_update',
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

export const createProfileActivityAction = async (activity: Omit<IProfileActivity, 'id' | 'createdAt'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await profileActivityRepository.create(activity);
    
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

export const enableTwoFactorAction = async (profileId: string | number, payload: IEnableTwoFactorPayload): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.enableTwoFactor(profileId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const verifyTwoFactorAction = async (profileId: string | number, payload: IVerifyTwoFactorPayload): Promise<ActionResultType<any>> => {
  try {
    const result = await profileSecurityRepository.verifyTwoFactor(profileId, payload);
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const disableTwoFactorAction = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.disableTwoFactor(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const generateBackupCodesAction = async (profileId: string | number): Promise<ActionResultType<any>> => {
  try {
    const result = await profileSecurityRepository.generateBackupCodes(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const addTrustedDeviceAction = async (profileId: string | number, payload: IAddTrustedDevicePayload): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.addTrustedDevice(profileId, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const removeTrustedDeviceAction = async (profileId: string | number, deviceId: string): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.removeTrustedDevice(profileId, deviceId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const updatePasswordChangeAction = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.updatePasswordChange(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'password_change',
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

export const resetFailedAttemptsAction = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.resetFailedAttempts(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const lockProfileAccountAction = async (profileId: string | number, durationHours: number = 24): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.lockAccount(profileId, durationHours);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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

export const unlockProfileAccountAction = async (profileId: string | number): Promise<ActionResultType<void>> => {
  try {
    await profileSecurityRepository.unlockAccount(profileId);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.profiles());
    await revalidateCacheTag(accessControlTags.profile(profileId));
    
    // Log activity
    await profileActivityRepository.create({
      profile_id: profileId,
      activity_type: 'profile_update',
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
