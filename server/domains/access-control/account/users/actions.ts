'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  usersRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type { 
  ICreateUserPayload, 
  IUpdateUserPayload
} from './types';

// --- Users Actions -------------------------------------------------

export const create_user_action = async (payload: ICreateUserPayload): Promise<ActionResultType<any>> => {
  try {
    const user = await usersRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.users());
    
    return { success: true, data: user };
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
        message: 'Failed to create user',
        details: error
      }
    };
  }
};

export const update_user_action = async (id: number, payload: IUpdateUserPayload): Promise<ActionResultType<any>> => {
  try {
    const user = await usersRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.users());
    await revalidateCacheTag(accessControlTags.user(id));
    
    return { success: true, data: user };
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
        message: 'Failed to update user',
        details: error
      }
    };
  }
};

export const delete_user_action = async (id: number): Promise<ActionResultType<void>> => {
  try {
    await usersRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.users());
    await revalidateCacheTag(accessControlTags.user(id));
    
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
        message: 'Failed to delete user',
        details: error
      }
    };
  }
};

