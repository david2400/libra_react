'use server';

import { revalidateCacheTag } from '@/server/lib/cache-tags';

import {
  companiesRepository,
  companyClientsRepository,
  companyActivityRepository,
  companyConfigRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import { ServerApiError, type ActionResultType } from '@/server/lib/types';
import type {
  ICreateCompany,
  IUpdateCompany,
  ICreateCompanyClient,
  IUpdateCompanyClient,
  ICompanyActivity,
  ICreateCompanyConfig,
  IUpdateCompanyConfig
} from './types';

// --- Companies Actions ---------------------------------------------------------

export const createCompanyAction = async (payload: ICreateCompany): Promise<ActionResultType<any>> => {
  try {
    const company = await companiesRepository.create(payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());

    return { success: true, data: company };
  } catch (error) {
    throw error;
  }
};

export const updateCompanyAction = async (id: string | number, payload: IUpdateCompany): Promise<ActionResultType<any>> => {
  try {
    const company = await companiesRepository.update(id, payload);

    // // Revalidate cache tags
    // await revalidateCacheTag(accessControlTags.companies());
    // await revalidateCacheTag(accessControlTags.company(id));

    // Activity logging disabled: company-activities endpoint is not available

    return { success: true, data: company };
  } catch (error) {
    throw error;
  }
};

export const deleteCompanyAction = async (id: string | number): Promise<ActionResultType<void>> => {
  try {
    await companiesRepository.delete(id);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(id));

    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};

// --- ICompany-Client Relationships Actions ---------------------------------

export const createCompanyClientAction = async (companyId: string | number, clientId: string | number, payload: ICreateCompanyClient): Promise<ActionResultType<any>> => {
  try {
    const companyClient = await companyClientsRepository.create(companyId, clientId, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.client(clientId));

    // Log activity
    await companyActivityRepository.create({
      company_id: companyId,
      activity_type: 'client_added',
      description: `Client added to company (Client ID: ${clientId})`,
      metadata: {
        client_id: clientId,
        is_primary: payload.is_primary,
        relationship_type: payload.relationship_type
      }
    });

    return { success: true, data: companyClient };
  } catch (error) {
    throw error;
  }
};

export const updateCompanyClientAction = async (companyId: string | number, clientId: string | number, payload: IUpdateCompanyClient): Promise<ActionResultType<any>> => {
  try {
    const companyClient = await companyClientsRepository.update(companyId, clientId, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));

    // Log activity
    await companyActivityRepository.create({
      company_id: companyId,
      activity_type: 'profile_update',
      description: `ICompany-client relationship updated (Client ID: ${clientId})`,
      metadata: {
        client_id: clientId,
        updated_fields: Object.keys(payload)
      }
    });

    return { success: true, data: companyClient };
  } catch (error) {
    throw error;
  }
};

export const deleteCompanyClientAction = async (companyId: string | number, clientId: string | number): Promise<ActionResultType<void>> => {
  try {
    await companyClientsRepository.delete(companyId, clientId);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));
    await revalidateCacheTag(accessControlTags.client(clientId));

    // Log activity
    await companyActivityRepository.create({
      company_id: companyId,
      activity_type: 'client_removed',
      description: `Client removed from company (Client ID: ${clientId})`,
      metadata: { client_id: clientId }
    });

    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};

// --- ICompany Configuration Actions -----------------------------------------

export const createCompanyConfigAction = async (companyId: string | number, payload: ICreateCompanyConfig): Promise<ActionResultType<any>> => {
  try {
    const config = await companyConfigRepository.create(companyId, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));

    // Log activity
    await companyActivityRepository.create({
      company_id: companyId,
      activity_type: 'profile_update',
      description: `ICompany configuration added (Key: ${payload.key})`,
      metadata: {
        configKey: payload.key,
        isEncrypted: payload.is_encrypted
      }
    });

    return { success: true, data: config };
  } catch (error) {
    throw error;
  }
};

export const updateCompanyConfigAction = async (companyId: string | number, key: string, payload: IUpdateCompanyConfig): Promise<ActionResultType<any>> => {
  try {
    const config = await companyConfigRepository.update(companyId, key, payload);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));

    // Log activity
    await companyActivityRepository.create({
      company_id: companyId,
      activity_type: 'profile_update',
      description: `ICompany configuration updated (Key: ${key})`,
      metadata: {
        configKey: key,
        updatedFields: Object.keys(payload)
      }
    });

    return { success: true, data: config };
  } catch (error) {
    throw error;
  }
};

export const deleteCompanyConfigAction = async (companyId: string | number, key: string): Promise<ActionResultType<void>> => {
  try {
    await companyConfigRepository.delete(companyId, key);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(companyId));

    // Log activity
    await companyActivityRepository.create({
      company_id: companyId,
      activity_type: 'profile_update',
      description: `ICompany configuration deleted (Key: ${key})`,
      metadata: { configKey: key }
    });

    return { success: true, data: undefined };
  } catch (error) {
    throw error;
  }
};

// --- ICompany Activity Actions ---------------------------------------------

export const createCompanyActivityAction = async (activity: Omit<ICompanyActivity, 'id' | 'created_at'>): Promise<ActionResultType<any>> => {
  try {
    const createdActivity = await companyActivityRepository.create(activity);

    // Revalidate cache tags
    await revalidateCacheTag(accessControlTags.companies());
    await revalidateCacheTag(accessControlTags.company(activity.company_id));

    return { success: true, data: createdActivity };
  } catch (error) {
    throw error;
  }
};
