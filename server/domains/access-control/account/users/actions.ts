'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import { 
  usersRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type {
  ICreateUser,
  IUpdateUser
} from './types';

// --- Users Actions -------------------------------------------------

export const createUserAction = async (payload: ICreateUser): Promise<ActionResultType<any>> => {
  try {
    const user = await usersRepository.create(payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.users());
    
    return { success: true, data: user };
  } catch (error) {
    throw error;
  }
};

export const updateUserAction = async (id: number, payload: IUpdateUser): Promise<ActionResultType<any>> => {
  try {
    const user = await usersRepository.update(id, payload);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.users());
    await revalidateCacheTag(accessControlTags.user(id));
    
    return { success: true, data: user };
  } catch (error) {
    throw error;
  }
};

export const deleteUserAction = async (id: number): Promise<ActionResultType<void>> => {
  try {
    await usersRepository.delete(id);
    
    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.users());
    await revalidateCacheTag(accessControlTags.user(id));
    
    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};

