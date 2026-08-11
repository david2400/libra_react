'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import { userCompaniesRepository } from './repository';
import type { ICreateUserCompany, IUpdateUserCompany } from './types';

// ─── User-Company Actions ─────────────────────────────────────────────────────────

/**
 * Crear una nueva asignación de usuario a empresa
 */
export const createUserCompanyAction = async (
  payload: ICreateUserCompany
): Promise<ActionResultType<any>> => {
  try {
    const userCompany = await userCompaniesRepository.create(payload);
    await revalidateCacheTag(accessControlTags.user(payload.user_id));
    await revalidateCacheTag(accessControlTags.company(payload.company_id));
    await revalidateCacheTag(accessControlTags.users());
    await revalidateCacheTag(accessControlTags.companies());
    return { success: true, data: userCompany };
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar una asignación existente de usuario a empresa
 */
export const updateUserCompanyAction = async (
  userId: number,
  companyId: number,
  payload: IUpdateUserCompany
): Promise<ActionResultType<any>> => {
  try {
    const userCompany = await userCompaniesRepository.update(userId, companyId, payload);
    await revalidateCacheTag(accessControlTags.user(userId));
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.users());
    await revalidateCacheTag(accessControlTags.companies());
    return { success: true, data: userCompany };
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una asignación de usuario a empresa
 */
export const deleteUserCompanyAction = async (
  userId: number,
  companyId: number
): Promise<ActionResultType<void>> => {
  try {
    await userCompaniesRepository.delete(userId, companyId);
    await revalidateCacheTag(accessControlTags.user(userId));
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.users());
    await revalidateCacheTag(accessControlTags.companies());
    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};
